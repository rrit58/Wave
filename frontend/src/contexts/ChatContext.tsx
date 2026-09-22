import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  id: string;
  name: string;
  email: string;
  userId: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  isOnline: boolean;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  availableUsers: User[];
  loadingChats: boolean;
  loadingMessages: boolean;
  selectChat: (chat: Chat | null) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  createOrGetChat: (recipientId: string) => Promise<Chat | null>;
  loadAvailableUsers: () => Promise<void>;
  loadChats: () => Promise<void>;
  socket: Socket | null;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  activeChat: null,
  messages: [],
  availableUsers: [],
  loadingChats: false,
  loadingMessages: false,
  selectChat: async () => {},
  sendMessage: async () => {},
  createOrGetChat: async () => null,
  loadAvailableUsers: async () => {},
  loadChats: async () => {},
  socket: null
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken, isLoggedIn } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const activeChatRef = useRef<Chat | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Load Chats list
  const loadChats = async () => {
    if (!isLoggedIn) return;
    setLoadingChats(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/list`);
      if (res.data.success) {
        setChats(res.data.chats);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Load available users to start a chat
  const loadAvailableUsers = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/users`);
      if (res.data.success) {
        setAvailableUsers(res.data.users);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  // Select a chat and fetch history
  const selectChat = async (chat: Chat | null) => {
    setActiveChat(chat);
    if (!chat) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/${chat.id}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }

      // Mark as read if there are unread messages
      if (chat.unread > 0) {
        await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/${chat.id}/read`);
        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Create or get a chat with recipient
  const createOrGetChat = async (recipientId: string): Promise<Chat | null> => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/get-or-create`, { recipientId });
      if (res.data.success) {
        const newChat = res.data.chat;
        setChats(prev => {
          if (prev.some(c => c.id === newChat.id)) return prev;
          return [newChat, ...prev];
        });
        await selectChat(newChat);
        return newChat;
      }
      return null;
    } catch (error) {
      console.error("Failed to get/create chat:", error);
      return null;
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!activeChat) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/message/send`, {
        chatId: activeChat.id,
        content
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!isLoggedIn || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setChats([]);
      setActiveChat(null);
      setMessages([]);
      setAvailableUsers([]);
      return;
    }

    // Connect socket to dedicated socket service
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
    const socketInstance = io(socketUrl, {
      auth: { token: accessToken }
    });
    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully to server");
      loadChats();
      loadAvailableUsers();
    });

    socketInstance.on("newMessage", (message: Message) => {
      // Update chats list
      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === message.chatId);
        if (!chatExists) {
          loadChats();
          return prevChats;
        }

        return prevChats.map(c => {
          if (c.id === message.chatId) {
            const isActive = activeChatRef.current && activeChatRef.current.id === message.chatId;
            const isMine = message.senderId === user?.id;
            return {
              ...c,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unread: isActive || isMine ? c.unread : c.unread + 1
            };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      });

      // If this message belongs to the currently active chat, append it
      if (activeChatRef.current && activeChatRef.current.id === message.chatId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Mark as read on server if sender is the other user
        if (message.senderId !== user?.id) {
          axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/chat/${message.chatId}/read`)
            .catch(err => console.error("Failed to mark message read on socket trigger:", err));
        }
      }
    });

    socketInstance.on("messagesRead", ({ chatId, readBy }) => {
      if (activeChatRef.current && activeChatRef.current.id === chatId) {
        setMessages(prev => prev.map(m => m.senderId === readBy ? m : { ...m, isRead: true }));
      }
    });

    socketInstance.on("userOnline", ({ userID }) => {
      setChats(prev => prev.map(c => c.userId === userID ? { ...c, isOnline: true } : c));
      setAvailableUsers(prev => prev.map(u => u.id === userID ? { ...u, isOnline: true } : u));
    });

    socketInstance.on("userOffline", ({ userID }) => {
      setChats(prev => prev.map(c => c.userId === userID ? { ...c, isOnline: false } : c));
      setAvailableUsers(prev => prev.map(u => u.id === userID ? { ...u, isOnline: false } : u));
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isLoggedIn, accessToken]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        availableUsers,
        loadingChats,
        loadingMessages,
        selectChat,
        sendMessage,
        createOrGetChat,
        loadAvailableUsers,
        loadChats,
        socket
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
