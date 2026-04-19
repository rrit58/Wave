import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Phone, Video, Search, MoreVertical, Paperclip, Smile, Send, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatWindow() {
  const messages = [
    { id: 1, text: "Hey! How's it going?", time: "10:30 AM", isMine: false },
    { id: 2, text: "I'm good, just working on the new app. You?", time: "10:32 AM", isMine: true },
    { id: 3, text: "Same here. What tech stack are you using?", time: "10:35 AM", isMine: false },
    { id: 4, text: "React, Tailwind v4, and Shadcn UI. It's incredibly smooth!", time: "10:38 AM", isMine: true },
    { id: 5, text: "Awesome. I love the new glassmorphism layouts and animations.", time: "10:40 AM", isMine: false },
    { id: 6, text: "Wait until you see the new chat window design! ✨", time: "10:42 AM", isMine: true }
  ];

  return (
    <div className="hidden md:flex flex-1 flex-col h-full bg-background relative">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#00f5ff]/10 via-background to-black" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Header */}
      <div className="h-[68px] flex items-center justify-between px-5 border-b border-border/30 bg-background/70 backdrop-blur-lg z-20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-[#00f5ff]/30">
            <AvatarFallback className="bg-[#00f5ff]/10 text-[#00f5ff] font-bold">
              AL
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold text-[15px]">Alice</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon"><Video /></Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex"><Phone /></Button>
          <Button variant="ghost" size="icon"><Search /></Button>
          <Button variant="ghost" size="icon"><MoreVertical /></Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-4 py-6 max-w-2xl mx-auto">

          <div className="flex justify-center">
            <span className="text-xs px-3 py-1 rounded-full bg-card border border-border/40 text-muted-foreground">
              Today
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[75%] ${
                msg.isMine ? "self-end" : "self-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl ${
                  msg.isMine
                    ? "bg-[#00f5ff] text-black rounded-br-sm shadow-md"
                    : "bg-card text-foreground border border-border/40 rounded-bl-sm"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                <div className="text-[10px] mt-1 text-right opacity-70">
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 bg-background/80 backdrop-blur-md border-t border-border/30 flex items-center gap-2">

        <Button variant="ghost" size="icon">
          <Smile />
        </Button>

        <Button variant="ghost" size="icon">
          <Paperclip />
        </Button>

        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            className="w-full bg-card border border-border/40 rounded-full px-5 h-[42px] focus-visible:ring-1 focus-visible:ring-[#00f5ff]"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 hidden sm:flex"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        <Button
          size="icon"
          className="rounded-full h-[42px] w-[42px] bg-[#00f5ff] text-black hover:scale-105 transition"
        >
          <Send className="h-5 w-5" />
        </Button>

      </div>
    </div>
  )
}