import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { CallOverlay } from "@/components/CallOverlay";

type CallState = "idle" | "calling" | "ringing" | "connected";
type CallType = "audio" | "video";

interface CallUser {
  id: string;
  name: string;
}

interface CallContextType {
  callState: CallState;
  callType: CallType;
  otherUser: CallUser | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCamOff: boolean;
  callDuration: number;
  startCall: (recipientId: string, recipientName: string, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

const CallContext = createContext<CallContextType>({
  callState: "idle",
  callType: "audio",
  otherUser: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCamOff: false,
  callDuration: 0,
  startCall: async () => {},
  acceptCall: async () => {},
  rejectCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
});

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ]
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { socket, availableUsers, chats } = useChat();

  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<CallType>("audio");
  const [otherUser, setOtherUser] = useState<CallUser | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const incomingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync localStreamRef
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Timer for connected call duration
  useEffect(() => {
    if (callState === "connected") {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callState]);

  // Clean up streams and peer connection
  const cleanupCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setOtherUser(null);
    setIsMuted(false);
    setIsCamOff(false);
    incomingOfferRef.current = null;
    iceCandidatesQueueRef.current = [];
  };

  // Socket signaling listener
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ from, offer, type }) => {
      console.log("Received incoming-call from:", from);
      
      // Look up caller name from contacts or active chats
      const sender = availableUsers.find((u) => u.id === from) || chats.find((c) => c.userId === from);
      const name = sender ? (sender as any).fullName || sender.name : "Incoming call";
      
      setOtherUser({ id: from, name });
      setCallType(type);
      setCallState("ringing");
      incomingOfferRef.current = offer;
    });

    socket.on("call-answered", async ({ answer }) => {
      console.log("Call answered by remote peer");
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallState("connected");
          
          // Process queued ICE candidates
          while (iceCandidatesQueueRef.current.length > 0) {
            const candidate = iceCandidatesQueueRef.current.shift();
            if (candidate) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
        } catch (error) {
          console.error("Error setting remote description on call-answered:", error);
        }
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ice candidate:", error);
        }
      } else {
        iceCandidatesQueueRef.current.push(candidate);
      }
    });

    socket.on("call-rejected", () => {
      console.log("Call was rejected by the other user");
      cleanupCall();
      alert("Call was rejected or the user is busy.");
    });

    socket.on("call-ended", () => {
      console.log("Call ended by remote user");
      cleanupCall();
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, [socket, availableUsers, chats]);

  // Create Peer Connection and attach tracks
  const createPeerConnection = (stream: MediaStream, recipientId: string) => {
    const pc = new RTCPeerConnection(iceServers);
    pcRef.current = pc;

    // Send local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Receive remote tracks
    const remoteMediaStream = new MediaStream();
    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
      });
      setRemoteStream(remoteMediaStream);
    };

    // Send ICE candidates to remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { to: recipientId, candidate: event.candidate });
      }
    };

    return pc;
  };

  // Start call
  const startCall = async (recipientId: string, recipientName: string, type: CallType) => {
    if (!socket) return;
    
    setCallState("calling");
    setCallType(type);
    setOtherUser({ id: recipientId, name: recipientName });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      setLocalStream(stream);

      const pc = createPeerConnection(stream, recipientId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call-user", { to: recipientId, offer, type });
    } catch (error) {
      console.error("Error accessing user media for call:", error);
      alert("Failed to access camera or microphone. Please check permissions.");
      cleanupCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!socket || !otherUser || !incomingOfferRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      setLocalStream(stream);

      const pc = createPeerConnection(stream, otherUser.id);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOfferRef.current));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-call", { to: otherUser.id, answer });
      setCallState("connected");

      // Process any queued ICE candidates
      while (iceCandidatesQueueRef.current.length > 0) {
        const candidate = iceCandidatesQueueRef.current.shift();
        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Failed to access camera or microphone.");
      rejectCall();
    }
  };

  // Reject call
  const rejectCall = () => {
    if (socket && otherUser) {
      socket.emit("reject-call", { to: otherUser.id });
    }
    cleanupCall();
  };

  // End call
  const endCall = () => {
    if (socket && otherUser) {
      socket.emit("end-call", { to: otherUser.id });
    }
    cleanupCall();
  };

  // Toggle local mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle local camera
  const toggleCamera = () => {
    if (localStreamRef.current && callType === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        otherUser,
        localStream,
        remoteStream,
        isMuted,
        isCamOff,
        callDuration,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
      <CallOverlay />
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
