'use client';

import { motion } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import RedMid from '@/assets/images/red.jpeg'
import Recent1 from '@/assets/images/recent1.png'
import Recent3 from '@/assets/images/recent3.png'
import Recent4 from '@/assets/images/recent4.png'
import Recent5 from '@/assets/images/recent5.png'
import Recent6 from '@/assets/images/recent6.png'

import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

const RecentWorksSection = () => {
    const imageUrls = [
        Recent1.src,
        RedMid.src,
        Recent3.src,
        Recent4.src,
        Recent5.src,
        Recent6.src,
    ];

    const [isMobile, setIsMobile] = useState(true);
    
    useEffect(() => {
        setIsMobile(window.innerWidth >= 768);
        
        const handleResize = () => {
            setIsMobile(window.innerWidth >= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex + 1 >= imageUrls.length ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex - 1 < 0 ? imageUrls.length - 1 : prevIndex - 1
        );
    };

    return (
        <section className="h-auto my-20 flex-col justify-start items-center gap-14 flex">
            <div className="self-stretch md:px-20 mx-4 md:flex justify-between items-center ">
                <div className="grow shrink basis-0 h-12 px-6 py-2.5 border-l-8 border-black justify-start items-center gap-2.5 flex">
                    <div className="text-left text-black text-xl md:text-2xl font-bold leading-loose">
                        MY MOST RECENT MAKEUP
                    </div>
                </div>
                <div className="grow mt-12 md:mt-0 shrink basis-0 text-black text-base font-normal md:text-xl leading-relaxed tracking-tight">
                    Check out my recent makeup lineups below for a glimpse into my latest
                    creations! From bold and glamorous to soft and natural, each look
                    showcases my passion for artistry and attention to detail.
                </div>
            </div>
            <div className="relative w-full max-w-7xl px-4">
                <div className="flex justify-center items-center gap-6">
                    <button 
                        onClick={prevSlide}
                        className="absolute left-0 z-10 bg-black/30 hover:bg-black/50 text-white p-6 rounded-full"
                    >
                        <IoChevronBackOutline size={28} />
                    </button>
                    
                    <div className="flex gap-6 justify-center">
                        <motion.div
                            key={`image-${currentIndex}`}
                            className="w-full "
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <img 
                                src={imageUrls[currentIndex]} 
                                alt={`Eunice Makeover ${currentIndex}`} 
                                className="h-80 md:h-full rounded-tl-3xl rounded-br-3xl shadow-lg"
                            />
                        </motion.div>
                        
                        {isMobile && (
                            <motion.div
                                key={`image-${(currentIndex + 1) % imageUrls.length}`}
                                className="hidden md:block w-full max-w-[80%]"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <img 
                                    src={imageUrls[(currentIndex + 1) % imageUrls.length]} 
                                    alt={`Eunice Makeover ${(currentIndex + 1) % imageUrls.length}`} 
                                    className="h-80 md:h-full rounded-tl-3xl rounded-br-3xl shadow-lg"
                                />
                            </motion.div>
                        )}
                    </div>
                    <button 
                        onClick={nextSlide}
                        className="absolute right-0 z-10 bg-black/30 hover:bg-black/50 text-white p-6 rounded-full"
                    >
                        <IoChevronForwardOutline size={28} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default RecentWorksSection;

