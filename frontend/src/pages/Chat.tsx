import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'

const Chat = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <ChatWindow />
    </div>
  )
}

export default Chat
