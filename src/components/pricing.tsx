import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import StudioSess from '@/assets/images/studio_session.png'
import MainlandSess from '@/assets/images/mainland_session.png'
import Island1Sess from '@/assets/images/island_session1.png'
import Island2Sess from '@/assets/images/island_session2.png'
import Island3Sess from '@/assets/images/island_session3.png'

type ServiceSession = {
    image: string;
    title: string;
    price_per_session: string;
    description: string;
    location: string;
    open_days: string;
    duration: string;
};

const PricingSection = () => {
    const [studioDropDown, openStudioDropDown] = useState(false)
    const [homeDropDown, openHomeDropDown] = useState(false)

    const studioServices: ServiceSession[] = [
        {
            image: StudioSess.src,
            title: "Studio makeup session",
            price_per_session: "₦ 25,000 Per session",
            description: "Have your makeup professionally done in our makeup store any week days and weekend from 9AM - 6PM",
            location: "Location: 134 Ahmadu bello way, victoria island, Lagos",
            open_days: "Monday - Saturday",
            duration: "1hr",
        }
    ];

    const homeServices: ServiceSession[] = [
        {
            image: MainlandSess.src,
            title: "Home service makeup session (Mainland)",
            price_per_session: "₦ 50,000 Per session",
            description: "Book a home service makeup session with us. Prices varies from location to location.",
            location: "Yaba, Ikeja, Surulere.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        },
        {
            image: Island1Sess.src,
            title: "Home service makeup session (Island)",
            price_per_session: "₦ 40,000 Per session",
            description: "Book a home service makeup session with us. Prices varies from location to location.",
            location: "Location: Victoria island, Ikoyi, Banana island.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        },

        {
            image: Island2Sess.src,
            title: "Home service makeup session (Island)",
            price_per_session: "₦ 35,000 Per session",
            description: "Book a home service makeup session with us. Prices varies from location to location.",
            location: "Location: Lekki, Ikate, Chevron.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        },
        {
            image: Island3Sess.src,
            title: "Home service makeup session (Island)",
            price_per_session: "₦ 40,000 Per session",
            description: "Book a home service makeup session with us. Prices varies from location to location.",
            location: "Location: Ajah, Lekki garden.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        }
    ];

    return (
        <section id='pricing' className="px-4 bg-black sm:px-8 lg:px-20 py-16 w-full">
            <motion.div
                className="flex flex-col justify-start items-start gap-24 inline-flex w-[100%]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="text-7xl sm:text-8xl md:text-9xl font-bold leading-10">
                    PRICING
                </div>
                <div className="flex flex-col justify-center items-start gap-6 w-[100%]">
                    <div className="p-4 rounded-2xl border border-white justify-between items-center inline-flex w-full relative" onClick={() => openStudioDropDown(!studioDropDown)}>
                        <div className="flex justify-start items-center gap-6">
                            <div className="text-base  md:text-xl font-normal leading-relaxed tracking-tight">
                                1.
                            </div>
                            <div className="text-base md:text-xl font-normal leading-relaxed tracking-tight">
                                Studio makeup session
                            </div>
                        </div>
                        <div className="cursor-pointer">
                            <IoChevronDownOutline
                                className={`transform transition-transform ${studioDropDown ? 'rotate-180' : ''}`}
                                size={24}
                            />
                        </div>
                        {studioDropDown && (
                            <div className="absolute top-full z-50 left-0 mt-2 w-full bg-black rounded-lg shadow-lg p-4">
                                <div className="flex z-50 flex-col w-full gap-4">
                                    {studioServices.map((service, index) => {
                                        return (
                                            <div key={index} className="flex w-full h-[400px] border border-white rounded-3xl p-4 gap-8">
                                                <div className='w-1/2 h-full'>
                                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover rounded-3xl" />
                                                </div>
                                                <div className="w-1/2 flex flex-col justify-between py-8">
                                                    <h3 className="text-xl font-bold">{service.title}</h3>
                                                    <p className="font-bold">{service.price_per_session}</p>
                                                    <p className="text-muted-foreground">{service.description}</p>
                                                    <p className="text-muted-foreground">{service.location}</p>
                                                    <p className="text-muted-foreground">{service.open_days}</p>
                                                    <p className="text-muted-foreground">Duration: {service.duration}</p>
                                                    <button className="bg-[#A68EA5] text-primary-foreground hover:bg-primary/80 mt-2 p-2 rounded transition-colors">Book Now</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 rounded-2xl border border-white justify-between items-center inline-flex w-full relative" onClick={() => openHomeDropDown(!homeDropDown)}>
                        <div className="flex justify-between items-center gap-6">
                            <div className="text-base md:text-xl font-normal leading-relaxed tracking-tight">
                                2.
                            </div>
                            <div className="text-base md:text-xl font-normal leading-relaxed tracking-tight">
                                Home service makeup session
                            </div>
                        </div>
                        <div className="cursor-pointer">
                            <IoChevronDownOutline
                                className={`transform transition-transform ${homeDropDown ? 'rotate-180' : ''}`}
                                size={24}
                            />
                        </div>
                        {homeDropDown && (
                            <div className="absolute top-full z-50 left-0 mt-2 w-full bg-black rounded-lg shadow-lg p-4">
                                <div className="flex z-50 flex-col w-full gap-4">
                                    {homeServices.map((service, index) => {
                                        return (
                                            <div key={index} className="flex w-full h-[400px] border border-white rounded-3xl p-4 gap-8">
                                                <div className='w-1/2 h-full'>
                                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover rounded-3xl" />
                                                </div>
                                                <div className="w-1/2 flex flex-col justify-between py-8">
                                                    <h3 className="text-xl font-bold">{service.title}</h3>
                                                    <p className="font-bold">{service.price_per_session}</p>
                                                    <p className="text-muted-foreground">{service.description}</p>
                                                    <p className="text-muted-foreground">{service.location}</p>
                                                    <p className="text-muted-foreground">{service.open_days}</p>
                                                    <p className="text-muted-foreground">Duration: {service.duration}</p>
                                                    <button className="bg-[#A68EA5] text-primary-foreground hover:bg-primary/80 mt-2 p-2 rounded transition-colors">Book Now</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

export default PricingSection;