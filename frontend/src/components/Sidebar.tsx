import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MessageSquarePlus, MoreVertical, Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useChat } from "@/contexts/ChatContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { chats, activeChat, selectChat, availableUsers, createOrGetChat } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    
    const tempYesterday = new Date(now);
    tempYesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === tempYesterday.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter lists based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = availableUsers.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (recipientId: string) => {
    await createOrGetChat(recipientId);
    setShowUserSearch(false);
    setSearchQuery("");
  };

  return (
    <div className="w-[25%] min-w-[280px] flex flex-col border-r border-border/40 h-full overflow-hidden bg-background">
      {/* Sidebar Header */}
      <div className="h-[60px] shrink-0 flex items-center justify-between px-3 border-b border-border/30 bg-background/70 backdrop-blur-lg">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-[#00f5ff]/50 transition-all shadow-sm">
              <AvatarFallback className="bg-[#00f5ff]/10 text-[#00f5ff] font-bold">
                {user?.fullName ? user.fullName.substring(0, 1).toUpperCase() : "ME"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 mt-2 rounded-2xl bg-card border border-border/50 shadow-xl">
            <DropdownMenuLabel className="font-semibold text-foreground">
              <div className="flex flex-col">
                <span className="text-sm font-bold">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500 hover:text-red-600 focus:text-red-500 font-semibold py-2 rounded-xl cursor-pointer flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-[2px]">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowUserSearch(!showUserSearch)}
            className={`text-muted-foreground hover:text-foreground transition-colors rounded-full ${showUserSearch ? 'bg-accent text-[#00f5ff]' : ''}`}
          >
            <MessageSquarePlus />
          </Button>
          <ModeToggle />
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-3 border-border/40 bg-background/30 backdrop-blur-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#00f5ff] transition-colors" />
          <Input 
            placeholder={showUserSearch ? "Search users to message..." : "Search chats..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card/50 border-border/50 placeholder:text-muted-foreground h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-[#00f5ff]/50 shadow-sm transition-all" 
          />
        </div>
      </div>

      {/* Dynamic List */}
      <ScrollArea className="flex-1 p-2">
        <div className="flex flex-col gap-1">
          {showUserSearch ? (
            /* User Search List */
            <>
              <h4 className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">Start a New Chat</h4>
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No other users found.
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => handleStartChat(u.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-accent/60 border border-transparent hover:border-border/50 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10 border border-border/50 shadow-sm relative">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {u.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                      {u.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                      )}
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-sm truncate">{u.fullName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            /* Active Chats List */
            <>
              <h4 className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">Messages</h4>
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {searchQuery ? "No chats match your search." : "No active chats. Start one by clicking the message icon above!"}
                </div>
              ) : (
                filteredChats.map(chat => {
                  const isActive = activeChat?.id === chat.id;
                  return (
                    <div 
                      key={chat.id} 
                      onClick={() => selectChat(chat)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${isActive ? 'bg-[#00f5ff]/10 border-[#00f5ff]/20 shadow-sm' : 'bg-transparent border-transparent hover:bg-accent/60 hover:shadow-sm hover:border-border/50'}`}
                    >
                      <Avatar className="h-12 w-12 border border-border/50 shadow-sm relative">
                        <AvatarFallback className={isActive ? "bg-[#00f5ff] text-black font-bold" : "bg-accent text-foreground font-semibold"}>
                          {chat.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                        {chat.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                        )}
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold text-[15px] truncate ${isActive ? 'text-[#00f5ff]' : ''}`}>{chat.name}</h3>
                          <span className={`text-[11px] font-medium ${chat.unread > 0 ? "text-[#00f5ff]" : "text-muted-foreground"}`}>
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className={`text-[13px] truncate pr-2 ${chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {chat.lastMessage || "Start of conversation"}
                          </p>
                          {chat.unread > 0 && (
                            <span className="bg-[#00f5ff] text-black text-[10px] font-bold h-5 w-5 min-w-5 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-[#00f5ff]/30">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Sidebar
