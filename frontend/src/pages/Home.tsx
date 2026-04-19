import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'

const Home = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative animate-in fade-in zoom-in-95 duration-500">
      <Sidebar />
      <ChatWindow />
    </div>
  )
}

export default Home