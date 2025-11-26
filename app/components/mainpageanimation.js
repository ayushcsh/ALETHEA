'use client'

import { motion } from 'framer-motion'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const mainpageanimation = () => {
  return (
    <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden">

      {/* BACKGROUND IMAGE */}
      <Image
        src="/images/second.png"         // <-- change to your image
        alt="background"
        fill
        priority  
        className="object-cover object-center -z-10"
      />

      {/* OPTIONAL DARK OVERLAY (makes text more readable) */}
      <div className="absolute inset-0 bg-black/40 -z-10"></div>

      {/* MAIN CONTENT */}
      <div className="md:w-[100%] w-[80%] p-2 flex flex-col justify-center items-center mt-[30px] md:mt-[0px] text-white">
        
        <h1 className="text-[30px] md:text-[55px] font-bebas font-bold text-center">
          Chat,{" "}
          <motion.span
            className="text-transparent bg-clip-text bg-gradient-to-t from-black via-[#d03902] to-[#d03902]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            Summarize
          </motion.span>
          {" "} & Learn
        </h1>

        <h1 className="text-[20px] md:text-[30px] font-bebas font-bold text-center">
          from Your PDFs — Powered by{" "}
          <motion.span
            className="text-transparent bg-clip-text bg-gradient-to-t from-black via-[#d03902] to-[#d03902]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            AI
          </motion.span>
        </h1>

        <p className="text-center text-[14px] md:text-[18px] mt-[20px]">
          <motion.span className="text-transparent bg-clip-text bg-gradient-to-t from-black via-[#d03902] to-[#d03902]">
            Summarize
          </motion.span>{" "}
          key content,{" "}
          <motion.span className="text-transparent bg-clip-text bg-gradient-to-t from-black via-[#d03902] to-[#d03902]">
            Take notes
          </motion.span>
          , and{" "}
          <motion.span className="text-transparent bg-clip-text bg-gradient-to-t from-black via-[#d03902] to-[#d03902]">
            Ask questions
          </motion.span>{" "}
          naturally
        </p>

        <p className="text-center text-[10px] md:text-[14px] mt-[10px] font-[Arial]">
          Transform your study materials into interactive learning experiences
        </p>

        <Link href="/login">
          <button className="mt-[30px] bg-black text-white border-2 border-[#ff6600] shadow-glow-orange md:h-[60px] h-[55px] font-bold w-[150px] rounded-3xl shadow-[0_0_20px_#ff6600] transition-all duration-300 cursor-pointer">
            Get started
          </button>
        </Link>
      </div>

    </div>
  )
}

export default mainpageanimation
