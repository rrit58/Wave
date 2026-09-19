import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Phone, Video, Search, MoreVertical, Paperclip, Smile, Send, Mic, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useChat } from "@/contexts/ChatContext"
import { useCall } from "@/contexts/CallContext"

const ChatWindow = () => {
  const { user } = useAuth();
  const { activeChat, messages, sendMessage, loadingMessages } = useChat();
  const { startCall } = useCall();
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message sending
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await sendMessage(inputText.trim());
    setInputText("");
  };

  const formatMessageTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-card/10 text-center p-8 h-full">
        <div className="h-16 w-16 rounded-full bg-[#00f5ff]/10 text-[#00f5ff] flex items-center justify-center mb-6 shadow-lg shadow-[#00f5ff]/10">
          <Smile className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Wave!</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Select an existing chat from the list or click the message bubble icon to start a new chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-background relative border-l border-border/20">
      {/* Header */}
      <div className="h-[60px] shrink-0 flex items-center justify-between px-5 border-b border-border/30 bg-background/70 backdrop-blur-lg z-20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-[#00f5ff]/30">
            <AvatarFallback className="bg-[#00f5ff]/10 text-[#00f5ff] font-bold">
              {activeChat.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold text-[15px]">{activeChat.name}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${activeChat.isOnline ? "bg-green-500" : "bg-zinc-500"}`}></span>
              {activeChat.isOnline ? "online" : "offline"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-foreground cursor-pointer"
            onClick={() => startCall(activeChat.userId, activeChat.name, "video")}
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex hover:text-foreground cursor-pointer"
            onClick={() => startCall(activeChat.userId, activeChat.name, "audio")}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-foreground"><Search className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="hover:text-foreground"><MoreVertical className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Loading chat history...
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-6">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground my-8">
                This is the start of your chat history with {activeChat.name}.
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[70%] ${isMine ? "self-end" : "self-start"}`}
                  >
                    <div 
                      className={`rounded-2xl border shadow-sm min-w-[80px] flex flex-col ${
                        isMine 
                          ? "bg-[#00f5ff] text-black rounded-tr-none border-[#00f5ff]/20" 
                          : "bg-card text-card-foreground border-border/40 rounded-tl-none dark:bg-zinc-800"
                      }`}
                    >
                      {/* Message Text */}
                      <div className="pt-2.5 px-3.5 pb-1">
                        <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      
                      {/* Time & Receipts */}
                      <div className={`px-2.5 pb-1.5 flex items-center justify-end gap-0.5 self-end select-none ${isMine ? "text-black/60" : "text-muted-foreground"}`}>
                        <span className="text-[9px] font-semibold">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isMine && (
                          msg.isRead ? (
                            <CheckCheck className="h-3.5 w-3.5 text-blue-600 font-bold" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-black/45" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-background/80 backdrop-blur-md border-t border-border/30 flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"> 
          <Smile /> 
        </Button>
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"> 
          <Paperclip /> 
        </Button>
        
        <div className="flex-1 relative">
          <Input 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-card border border-border/40 rounded-full px-5 h-[42px] focus-visible:ring-1 focus-visible:ring-[#00f5ff] placeholder:text-muted-foreground" 
          />
          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 hidden sm:flex text-muted-foreground hover:text-foreground">
            <Mic className="h-5 w-5" />
          </Button>
        </div>
        
        <Button 
          type="submit"
          disabled={!inputText.trim()}
          size="icon" 
          className="rounded-full h-[42px] w-[42px] bg-[#00f5ff] text-black hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}

export default ChatWindow