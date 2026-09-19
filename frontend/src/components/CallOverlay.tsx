import { useEffect, useRef } from "react";
import { useCall } from "@/contexts/CallContext";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function CallOverlay() {
  const {
    callState,
    callType,
    otherUser,
    localStream,
    remoteStream,
    isMuted,
    isCamOff,
    callDuration,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream && callType === "video") {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState, callType]);

  // Set remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && callType === "video") {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState, callType]);

  // Set remote audio stream (for voice call)
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream && callType === "audio") {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState, callType]);

  if (callState === "idle" || !otherUser) return null;

  // Format call duration timer (e.g. 01:24)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      {/* RINGING / INCOMING STATE */}
      {callState === "ringing" && (
        <div className="w-[380px] p-8 rounded-3xl bg-card border border-border/50 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
          <div className="relative mb-6">
            {/* Pulsing Sonar Effect */}
            <div className="absolute inset-0 rounded-full bg-[#00f5ff]/20 animate-sonar" />
            <div className="absolute inset-0 rounded-full bg-[#00f5ff]/15 animate-sonar" style={{ animationDelay: "0.6s" }} />
            <Avatar className="h-24 w-24 ring-4 ring-[#00f5ff]/30 relative z-10">
              <AvatarFallback className="bg-[#00f5ff]/10 text-[#00f5ff] text-2xl font-bold">
                {otherUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-1">{otherUser.name}</h3>
          <p className="text-sm text-muted-foreground mb-8">
            Incoming {callType} call...
          </p>

          <div className="flex items-center gap-6">
            <Button
              onClick={rejectCall}
              size="icon"
              className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:scale-105 transition-transform"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={acceptCall}
              size="icon"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 hover:scale-105 transition-transform"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* OUTGOING / CALLING STATE */}
      {callState === "calling" && (
        <div className="w-[380px] p-8 rounded-3xl bg-card border border-border/50 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
          <div className="relative mb-6">
            {/* Pulsing Sonar Effect */}
            <div className="absolute inset-0 rounded-full bg-[#00f5ff]/20 animate-sonar" />
            <div className="absolute inset-0 rounded-full bg-[#00f5ff]/15 animate-sonar" style={{ animationDelay: "0.6s" }} />
            <Avatar className="h-24 w-24 ring-4 ring-[#00f5ff]/30 relative z-10">
              <AvatarFallback className="bg-[#00f5ff]/10 text-[#00f5ff] text-2xl font-bold">
                {otherUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-1">{otherUser.name}</h3>
          <p className="text-sm text-muted-foreground mb-8">
            Calling...
          </p>

          <Button
            onClick={endCall}
            size="icon"
            className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:scale-105 transition-transform"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* CONNECTED / ACTIVE CALL STATE */}
      {callState === "connected" && (
        <div className="relative w-full h-full max-w-4xl max-h-[85vh] md:rounded-3xl bg-card border border-border/40 overflow-hidden shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in duration-200">
          
          {/* VIDEO CALL */}
          {callType === "video" ? (
            <div className="relative w-full h-full flex-1 bg-black">
              {/* Remote Video Stream */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Avatar className="h-20 w-20 mb-4 bg-zinc-800">
                    <AvatarFallback className="text-lg font-bold">
                      {otherUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  Connecting video feed...
                </div>
              )}

              {/* Local Video Stream (PiP) */}
              <div className="absolute bottom-6 right-6 w-28 h-40 md:w-36 md:h-52 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl z-20">
                {localStream && !isCamOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xs text-white/60">
                    Cam Off
                  </div>
                )}
              </div>

              {/* Top Floating Details */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-white text-sm font-semibold">{otherUser.name}</span>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-sm font-medium tabular-nums pointer-events-auto">
                  {formatTime(callDuration)}
                </div>
              </div>
            </div>
          ) : (
            /* VOICE CALL */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-card to-background relative">
              {/* Hidden Remote Audio Element */}
              <audio ref={remoteAudioRef} autoPlay playsInline />

              <Avatar className="h-28 w-28 ring-4 ring-[#00f5ff]/20 mb-8 shadow-xl">
                <AvatarFallback className="bg-[#00f5ff]/10 text-[#00f5ff] text-3xl font-bold">
                  {otherUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-2xl font-bold text-foreground mb-1">{otherUser.name}</h3>
              <p className="text-sm text-[#00f5ff] font-semibold tabular-nums tracking-wide mb-8">
                {formatTime(callDuration)}
              </p>

              {/* Dynamic Audio Waves */}
              <div className="flex items-center gap-[6px] h-16 justify-center">
                <span className="w-1.5 bg-[#00f5ff] rounded-full animate-call-wave" style={{ animationDelay: "0.1s" }} />
                <span className="w-1.5 bg-[#00f5ff] rounded-full animate-call-wave" style={{ animationDelay: "0.3s" }} />
                <span className="w-1.5 bg-[#00f5ff] rounded-full animate-call-wave" style={{ animationDelay: "0.5s" }} />
                <span className="w-1.5 bg-[#00f5ff] rounded-full animate-call-wave" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 bg-[#00f5ff] rounded-full animate-call-wave" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          {/* CONTROLS BAR */}
          <div className="p-6 bg-card/90 border-t border-border/40 flex items-center justify-center gap-6 z-30">
            {/* Mic Toggle */}
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className={`h-12 w-12 rounded-full border-border/60 hover:scale-105 transition-transform ${
                isMuted ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" : "bg-accent/40 text-foreground hover:bg-accent"
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* End Call */}
            <Button
              onClick={endCall}
              size="icon"
              className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:scale-105 transition-transform"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Video Toggle (Only in video call) */}
            {callType === "video" && (
              <Button
                onClick={toggleCamera}
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-full border-border/60 hover:scale-105 transition-transform ${
                  isCamOff ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" : "bg-accent/40 text-foreground hover:bg-accent"
                }`}
              >
                {isCamOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
