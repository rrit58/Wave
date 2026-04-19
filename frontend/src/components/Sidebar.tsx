import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MessageSquarePlus, MoreVertical, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
// import { useState } from "react"

const chats = [
    { id: 1, name: "Alice", avatar: "", message: "Hey, are we still on?", time: "10:42 AM", unread: 2, active: true },
    { id: 2, name: "Bob", avatar: "", message: "Looks good to me.", time: "Yesterday", unread: 0, active: false },
    { id: 3, name: "Charlie", avatar: "", message: "Can you send the logo?", time: "Yesterday", unread: 0, active: false },
    { id: 4, name: "David", avatar: "", message: "I'll be there in 5.", time: "Monday", unread: 1, active: false },
    { id: 5, name: "Eve", avatar: "", message: "Haha, nice!", time: "Monday", unread: 0, active: false },
    { id: 6, name: "Fiona", avatar: "", message: "Sounds like a plan.", time: "Sunday", unread: 0, active: false },
    { id: 7, name: "George", avatar: "", message: "Got it.", time: "Last week", unread: 0, active: false },
    { id: 8, name: "Hannah", avatar: "", message: "See you later!", time: "Last week", unread: 5, active: false }
  ];

const Sidebar = () => {
  // const [activeChat, setActiveChat] = useState(1)
  
  return (
    <div className="w-[25%] flex flex-col border-r-2 border-border/40 h-full">
      {/* Sidebar Header */}
      <div className="h-[72px] flex items-center justify-between px-4 border-b border-border/40 bg-background/50 backdrop-blur-md">
        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-[#00f5ff]/50 transition-all shadow-sm">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-[2px]">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent/80"><MessageSquarePlus className="h-[22px] w-[22px]" /></Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent/80"><MoreVertical className="h-[22px] w-[22px]" /></Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-3 border-b border-border/40 bg-background/30 backdrop-blur-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#00f5ff] transition-colors" />
          <Input placeholder="Search or start a new chat" className="pl-9 bg-card/50 border-border/50 placeholder:text-muted-foreground h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-[#00f5ff]/50 shadow-sm transition-all" />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-1">
          {chats.map(chat => (
            <div key={chat.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${chat.active ? 'bg-[#00f5ff]/10 border-[#00f5ff]/20 shadow-sm' : 'bg-transparent border-transparent hover:bg-accent/60 hover:shadow-sm hover:border-border/50'}`}>
              <Avatar className="h-12 w-12 border border-border/50 shadow-sm">
                <AvatarFallback className={chat.active ? "bg-[#00f5ff] text-black font-semibold" : ""}>{chat.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-[15px] truncate ${chat.active ? 'text-[#00f5ff]' : ''}`}>{chat.name}</h3>
                  <span className={`text-[11px] font-medium ${chat.unread > 0 ? "text-[#00f5ff]" : "text-muted-foreground"}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-[13px] truncate pr-2 ${chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{chat.message}</p>
                  {chat.unread > 0 && (
                    <span className="bg-[#00f5ff] text-black text-[10px] font-bold h-5 w-5 min-w-5 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-[#00f5ff]/30">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Sidebar
