import { motion } from 'framer-motion';
import Recent, { useState, useRef, useEffect } from 'react';
import RedMid from '@/assets/images/red.jpeg'
const RecentWorksSection = () => {
    const imageUrls = [
        "https://via.placeholder.com/628x730",
        "https://via.placeholder.com/628x730",
        "https://via.placeholder.com/628x730",
        "https://via.placeholder.com/628x730",
        RedMid.src,
    ];

    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const handleScroll = () => {
        if (containerRef.current) {
            setScrollPosition(containerRef.current.scrollLeft);
        }
    };

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <section className="h-auto my-20 flex-col justify-start items-center gap-14 flex">
            <div className="self-stretch md:px-20 mx-4 md:flex justify-between items-center ">
                <div className="grow shrink basis-0 h-12 px-6 py-2.5 border-l-8 border-black justify-start items-center gap-2.5 flex">
                    <div className="text-left text-black text-xl font-bold leading-loose">
                        MY MOST RECENT MAKEUP
                    </div>
                </div>
                <div className="grow mt-12 md:mt-0 shrink basis-0 text-black text-base font-normal leading-relaxed tracking-tight">
                    Check out my recent makeup lineups below for a glimpse into my latest
                    creations! From bold and glamorous to soft and natural, each look
                    showcases my passion for artistry and attention to detail.
                </div>
            </div>
            <div className="overflow-x-scroll overflow-x-auto justify-center items-center flex">
                <div
                    className="h-full overflow-x-scroll overflow-x-hidden flex gap-6 transition-all duration-500 ease-in-out whitespace-wrap"
                    ref={containerRef}
                >
                    {imageUrls.map((imageUrl, index) => (
                        <motion.div
                            className='w-full max-w-80'
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <img src={imageUrl} alt="Eunice Makeover 3" className="h-80 md:h-full rounded-tl-3xl rounded-br-3xl shadow-lg transform transition-transform" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentWorksSection;

