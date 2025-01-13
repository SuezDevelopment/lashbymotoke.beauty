import { motion } from 'framer-motion';
const ServicesSection = () => {
    return (
        <section id='services' className="py-20 px-6 sm:px-8 lg:px-20">
            <motion.div
                className="flex flex-col lg:flex-row justify-between md:items-center  gap-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, staggerChildren: 0.2 }}
            >
                <motion.div
                    className="lg:w-1/3 h-[4rem] px-6 py-4 border-l-8 border-black"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h2 className="text-xl md:text-2xl font-bold text-black text-left">
                        MY SERVICES
                    </h2>
                </motion.div>
                <motion.div
                    className="lg:w-2/4 flex flex-col gap-14"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="flex flex-col gap-2.5">
                        <h3 className="text-xl md:text-2xl font-bold text-black text-right">
                            Bridal Makeup
                        </h3>
                        <p className="text-lg font-normal md:text-xl text-black text-right">
                            I do bridal makeup that ensures you look radiant and flawless on
                            your special day. Whether you want a classic, glamorous, or
                            natural look, I customize each application to match your style and
                            vision. With long-lasting, photo-ready makeup, you'll feel
                            confident from the ceremony to the last dance. Bridal trials are
                            available to perfect your look in advance, ensuring everything is
                            just as you imagined.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2.5 text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-black text-left lg:text-left">
                            Photoshoot Makeup
                        </h3>
                        <p className="text-lg font-normal md:text-xl text-black text-left lg:text-left">
                            I do professional photoshoot makeup, ensuring you're camera-ready
                            with a flawless, long-lasting look. Whether it’s for fashion,
                            editorial, or commercial shoots, I tailor the makeup to complement
                            lighting and enhance your features, so you look your best on
                            camera.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}


export default ServicesSection;