import prisma from "../config/dbConfig.js";
import { getOnlineUsers, isUserOnline, sendMessageToUser } from "../services/socketService.js";

// Fetch available verified users except the logged-in user
export const getAvailableUsers = async (req, res) => {
    try {
        const currentUserId = req.userID;
        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUserId },
                isVerified: true
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                isLoggedIn: true
            }
        });

        // Add online status dynamically from socket service
        const onlineUsersSet = await getOnlineUsers();
        const usersWithOnlineStatus = users.map(user => ({
            ...user,
            isOnline: onlineUsersSet.has(user.id)
        }));

        return res.status(200).json({ success: true, users: usersWithOnlineStatus });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch current user's chats
export const getChats = async (req, res) => {
    try {
        const currentUserId = req.userID;

        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    { userAId: currentUserId },
                    { userBId: currentUserId }
                ]
            },
            include: {
                userA: {
                    select: { id: true, fullName: true, email: true }
                },
                userB: {
                    select: { id: true, fullName: true, email: true }
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        const onlineUsersSet = await getOnlineUsers();

        const formattedChats = await Promise.all(chats.map(async (chat) => {
            const otherUser = chat.userAId === currentUserId ? chat.userB : chat.userA;
            
            const unreadCount = await prisma.message.count({
                where: {
                    chatId: chat.id,
                    senderId: otherUser.id,
                    isRead: false
                }
            });

            return {
                id: chat.id,
                name: otherUser.fullName,
                email: otherUser.email,
                userId: otherUser.id,
                isOnline: onlineUsersSet.has(otherUser.id),
                lastMessage: chat.messages[0] ? chat.messages[0].content : "",
                lastMessageTime: chat.messages[0] ? chat.messages[0].createdAt : chat.createdAt,
                unread: unreadCount
            };
        }));

        // Sort chats by last message time
        formattedChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        return res.status(200).json({ success: true, chats: formattedChats });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Find or Create a Chat
export const getOrCreateChat = async (req, res) => {
    try {
        const currentUserId = req.userID;
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ success: false, message: "Recipient ID is required." });
        }

        // Sort IDs lexicographically to respect the unique constraint
        const userAId = currentUserId < recipientId ? currentUserId : recipientId;
        const userBId = currentUserId < recipientId ? recipientId : currentUserId;

        let chat = await prisma.chat.findUnique({
            where: {
                userAId_userBId: { userAId, userBId }
            },
            include: {
                userA: { select: { id: true, fullName: true, email: true } },
                userB: { select: { id: true, fullName: true, email: true } }
            }
        });

        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    userAId,
                    userBId
                },
                include: {
                    userA: { select: { id: true, fullName: true, email: true } },
                    userB: { select: { id: true, fullName: true, email: true } }
                }
            });
        }

        const otherUser = chat.userAId === currentUserId ? chat.userB : chat.userA;
        const isOnline = await isUserOnline(otherUser.id);
        const formattedChat = {
            id: chat.id,
            name: otherUser.fullName,
            email: otherUser.email,
            userId: otherUser.id,
            isOnline,
            lastMessage: "",
            lastMessageTime: chat.createdAt,
            unread: 0
        };

        return res.status(200).json({ success: true, chat: formattedChat });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch message history for a specific chat
export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" }
        });

        return res.status(200).json({ success: true, messages });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Send message and broadcast it
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.userID;
        const { chatId, content } = req.body;

        if (!chatId || !content) {
            return res.status(400).json({ success: false, message: "Chat ID and content are required." });
        }

        const chat = await prisma.chat.findUnique({
            where: { id: chatId }
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found." });
        }

        const recipientId = chat.userAId === senderId ? chat.userBId : chat.userAId;

        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                chatId,
                isRead: false
            }
        });

        // Update chat updatedAt to sort it to the top
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        });

        // Broadcast newMessage event
        sendMessageToUser(recipientId, "newMessage", message);
        sendMessageToUser(senderId, "newMessage", message);

        return res.status(201).json({ success: true, message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Mark chat messages as read
export const markAsRead = async (req, res) => {
    try {
        const currentUserId = req.userID;
        const { chatId } = req.params;

        const chat = await prisma.chat.findUnique({
            where: { id: chatId }
        });

        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found." });
        }

        const otherUserId = chat.userAId === currentUserId ? chat.userBId : chat.userAId;

        await prisma.message.updateMany({
            where: {
                chatId,
                senderId: otherUserId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        // Notify other user that their messages were read
        sendMessageToUser(otherUserId, "messagesRead", { chatId, readBy: currentUserId });

        return res.status(200).json({ success: true, message: "Messages marked as read." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
