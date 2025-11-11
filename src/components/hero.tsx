import { motion } from 'framer-motion';

const HeroSection = () => {
    return (
        <section className="text-center pt-[14rem] px-4 sm:px-8 lg:px-20">
            <motion.h1
                className="text-black text-7xl sm:text-8xl md:text-9xl font-light leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                LASH BY{' '}
                <span className="font-normal"> </span>
                <span className="font-bold">MOTOKE</span>
            </motion.h1>
        </section>
    );
}

export default HeroSection;