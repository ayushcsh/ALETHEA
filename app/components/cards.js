'use client'

import { motion } from 'framer-motion';
import React from 'react'
import Image from 'next/image'

const Cards = ({tittle ,description, image}) => {
    return (
        <>
            <div className='md:mt-[60px] mt-[10px]'>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.5 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    
                >   

                    <div className='flex flex-col md:flex-row w-full md:h-[60vh] h-[60vh]'>
                    <div className="text-center px-4  md:w-[40vw] w-[85vw] ml-[30px] md:ml-[120px] md:h-[60vh] h-[26vh] flex flex-col justify-center">
                        <h1 className="md:text-[48px] text-[25px] font-bold text-white">
                            {tittle}
                        </h1>
                        <p className="md:text-[18px] text-[14px] text-[#434343] mt-4 max-w-[500px] mx-auto">
                            {description}
                        </p>
                    </div>
                    <div className='relative'>
                    <div className="md:w-[35vw] w-[86vw] md:ml-[120px] ml-[30px] md:h-[48vh] h-[30vh] md:mt-[50px] mt-[20px] rounded-[10px] absolute inset-0 bg-[#ff6600] blur-md"></div>
                    <div className='relative md:w-[35vw] w-[86vw] md:ml-[120px] ml-[30px] md:h-[48vh] h-[30vh] md:mt-[50px] mt-[20px] rounded-[10px]'>
                        <Image 
                          className='rounded-2xl object-cover' 
                          src={image} 
                          alt="Card image" 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                    </div>
                    </div>
                </motion.div>
                </div>
                
            
        </>
    )
}

export default Cards
