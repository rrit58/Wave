/**
 * WebRTC Voice & Video Call Signaling Handlers
 */
export const registerCallHandlers = (io, socket) => {
    const userID = socket.userID;

    socket.on("call-user", ({ to, offer, type }) => {
        console.log(`[CallHandler] Call offer from ${userID} to ${to} (${type})`);
        socket.to(to).emit("incoming-call", {
            from: userID,
            offer,
            type
        });
    });

    socket.on("answer-call", ({ to, answer }) => {
        console.log(`[CallHandler] Call answer from ${userID} to ${to}`);
        socket.to(to).emit("call-answered", {
            answer
        });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        socket.to(to).emit("ice-candidate", {
            candidate
        });
    });

    socket.on("reject-call", ({ to }) => {
        console.log(`[CallHandler] Call rejected by ${userID} to ${to}`);
        socket.to(to).emit("call-rejected");
    });

    socket.on("end-call", ({ to }) => {
        console.log(`[CallHandler] Call ended by ${userID} to ${to}`);
        socket.to(to).emit("call-ended");
    });
};
