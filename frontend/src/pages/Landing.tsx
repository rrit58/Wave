import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-zinc-950 p-4">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 transition-transform duration-1000 md:hover:scale-105" 
        style={{ backgroundImage: "url('/hero.png')" }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[2px]" />
      
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 p-6 sm:p-10 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-md border border-white/20 shadow-lg">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white shadow-sm">Wave</span>
        </div>
        <ModeToggle />
      </div>

      {/* Center Landing Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-medium shadow-sm mb-8 text-white">
          <Sparkles className="h-4 w-4 text-emerald-400" /> The future of messaging
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-linear-to-br from-white via-white to-white/60 mb-6 drop-shadow-sm">
          Connect with your world <br className="hidden sm:block" /> seamlessly.
        </h1>
        
        <p className="text-lg sm:text-xl text-white/80 font-medium max-w-2xl mb-12 drop-shadow-sm">
          Wave brings your conversations to life with gorgeous design, unparalleled speed, and intuitive simplicity. Experience the next generation of chat seamlessly across all your devices.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
           <Button 
             size="lg" 
             className="w-full h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 rounded-full backdrop-blur-md"
             onClick={() => navigate('/register')}
           >
             Create an account
             <ArrowRight className="ml-2 h-5 w-5" />
           </Button>
           <Button 
             size="lg" 
             variant="outline"
             className="w-full h-14 text-lg font-semibold border-white/20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all rounded-full"
             onClick={() => navigate('/login')}
           >
             Sign In
           </Button>
        </div>
      </div>

      {/* Floating UI Elements for aesthetic flair */}
      <div className="hidden lg:block absolute top-[25%] left-[5%] xl:left-[10%] z-0 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl rounded-tl-none shadow-2xl -rotate-6 transform hover:scale-105 transition-transform duration-500 max-w-[220px]">
          <p className="text-white/90 text-sm font-medium leading-relaxed">Hey! Have you seen the new update? 🔥</p>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-[25%] right-[5%] xl:right-[10%] z-0 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
         <div className="bg-primary/90 text-white backdrop-blur-xl border border-white/20 p-4 rounded-2xl rounded-tr-none shadow-2xl rotate-3 transform hover:scale-105 transition-transform duration-500 max-w-[220px]">
          <p className="text-white/95 text-sm font-medium leading-relaxed">Yes! The new UI is absolutely stunning design work ✨</p>
        </div>
      </div>
    </div>
  )
}

export default Landing
