import React from 'react'
import Hero from '@/assets/hero.png'

const About = () => {
    return (
        <div className='relative overflow-hidden'>
            <div className="absolute inset-0 bg-center opacity-100">
                <img className="h-full w-full object-cover" src={Hero} alt="Hero" />
            </div>
            {/* <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" /> */}
            {/* <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-xs" /> */}
            <div className='absolute z-10 top-0 left-0 right-0 bottom-0 bg-red-500 h-full w-full'>
                hhhhhhhhhhhhhhh
            </div>
        </div>
    )
}

export default About