import { motion } from 'framer-motion';
import RedMid from '@/assets/images/red.jpeg'
const MeSection = () => {
    return (
        <section className="py-12 px-8 sm:px-8 lg:px-20">
            <motion.div
                className="flex justify-center items-center gap-2 md:gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >

                <motion.div
                    className='w-full max-w-80'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <img src={RedMid.src} alt="Eunice Makeover 3" className="h-80 md:h-full rounded-tl-3xl rounded-br-3xl shadow-lg transform transition-transform object-cover" />
                </motion.div>

                <motion.div
                    className='w-full max-w-80'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <img src={RedMid.src} alt="Eunice Makeover 2" className="w-full h-80 max-w-80 upside-down md:h-full rounded-tl-3xl rounded-br-3xl shadow-lg transform transition-transform filter grayscale object-cover" />
                </motion.div>

                <motion.div
                    className='w-full max-w-80'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <img src={RedMid.src} alt="Eunice Makeover 3" className="invert h-80 md:h-full upside-down rounded-tl-3xl rounded-br-3xl shadow-lg transform transition-transform filter my-image object-cover" />
                </motion.div>
            </motion.div>
            <motion.div
                className='flex flex-col justify-center items-center text-black py-12 gap-8 font-[family-name:var(--font-geist-mali)]'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
            >
                <span className='text-base md:text-xl font-light text-center max-w-[33rem]'>Makeup is my art, where creativity meets precision, all while delivering exceptional customer service.</span>
                <span className='font-semibold  md:text-2xl'>-Eunice</span>
            </motion.div>
        </section>
    );
}

export default MeSection;