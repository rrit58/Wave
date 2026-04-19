import Hero from '@/assets/hero.png'

const Background = () => {
    return (
        <div>
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
                <img src={Hero} alt="Hero" className="w-full h-full object-cover brightness-40 scale-105" />
            </div>

            {/* Cyan + Dark Gradient (matches navbar color) */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-[#00f5ff]/20 to-black/30" />

            {/* Glow Accent (interactive feel) */}
            <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#00f5ff]/20 blur-[120px] rounded-full animate-pulse" />

            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#00f5ff]/10 blur-[100px] rounded-full" />
        </div>
    )
}

export default Background