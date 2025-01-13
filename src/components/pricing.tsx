import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import StudioSess from '@/assets/images/studio_session.png'
import MainlandSess from '@/assets/images/mainland_session.png'
import Island1Sess from '@/assets/images/island_session1.png'
import Island2Sess from '@/assets/images/island_session2.png'
import Island3Sess from '@/assets/images/island_session3.png'
import { SessionBookingFormData, SessionBookingModal } from './navHeader';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<SessionBookingFormData>({
        serviceType: '',
        scheduleDate: '',
        scheduleTime: '',
        scheduleLocation: '',
        specialRequest: '',
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        homeAddress: '',
    })

    const studioServices: ServiceSession[] = [
        {
            image: StudioSess.src,
            title: "Studio makeup session",
            price_per_session: "₦ 25,000 Per session",
            description: "Have your makeup professionally done in our makeup store any week days and weekend from 9AM - 6PM",
            location: "134 Ahmadu bello way, victoria island, Lagos",
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
            location: "Victoria island, Ikoyi, Banana island.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        },

        {
            image: Island2Sess.src,
            title: "Home service makeup session (Island)",
            price_per_session: "₦ 35,000 Per session",
            description: "Book a home service makeup session with us. Prices varies from location to location.",
            location: "Lekki, Ikate, Chevron.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        },
        {
            image: Island3Sess.src,
            title: "Home service makeup session (Island)",
            price_per_session: "₦ 40,000 Per session",
            description: "Book a home service makeup session with us. Prices varies from location to location.",
            location: "Ajah, Lekki garden.",
            open_days: "Monday - Sunday",
            duration: "1hr 30mins",
        }
    ];

    const handleSessionBooking = (formDataItems: { name: string; value: string; }[]) => {
        try {
            formDataItems.forEach(item => {
                setFormData(prev => ({
                    ...prev,
                    [item.name]: item.value
                }));
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error updating form data:", error);
        }
    };

    const clearFormData = () => {
        setFormData({
            serviceType: '',
            scheduleDate: '',
            scheduleTime: '',
            scheduleLocation: '',
            specialRequest: '',
            fullName: '',
            phoneNumber: '',
            emailAddress: '',
            homeAddress: '',
        });
    };



    return (
        <section id='pricing' className="px-4 bg-black sm:px-8 lg:px-20 py-16 w-full">
            {isModalOpen && <SessionBookingModal setIsModalOpen={setIsModalOpen} sessionBookingState={formData} onClose={() => clearFormData()} />}
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
                    <div className="flex flex-col w-full">
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
                        </div>
                        {studioDropDown && (
                            <div className="relative top-full z-30 left-0 mt-2 w-full bg-black rounded-lg shadow-lg p-4 h-fit" >
                                <div className="flex z-30 flex-col w-full gap-4">
                                    {studioServices.map((service, index) => {
                                        return (
                                            <div key={index} className="flex w-full h-[400px] border border-white rounded-3xl p-4 gap-8">
                                                <div className='w-1/2 h-full'>
                                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover rounded-3xl" />
                                                </div>
                                                <div className="w-1/2 flex flex-col justify-between md:py-8 overflow-y-auto relative h-full">
                                                    <div className="flex-1 space-y-2">
                                                        <h3 className="md:text-xl font-bold">{service.title}</h3>
                                                        <p className="font-bold md:text-xl">{service.price_per_session}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words">{service.description}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words"><span className='font-bold'>Location:</span> {service.location}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words">{service.open_days}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words">
                                                            <span className='font-bold'>Duration:</span> {service.duration}
                                                        </p>
                                                    </div>
                                                    <div onClick={() => handleSessionBooking([{ name: 'serviceType', value: "studio" }])} className="sticky bottom-0 left-0 right-0 bg-black pt-2">
                                                        <button className="bg-[#A68EA5] text-primary-foreground hover:bg-primary/80 p-2 rounded transition-colors w-full">
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="p-4 rounded-2xl border border-white justify-between items-center inline-flex w-full" onClick={() => openHomeDropDown(!homeDropDown)}>
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
                        </div>
                        {homeDropDown && (
                            <div className="relative top-full z-30 left-0 mt-2 w-full bg-black rounded-lg shadow-lg p-4 h-fit">
                                <div className="flex z-20 flex-col w-full gap-4">
                                    {homeServices.map((service, index) => {
                                        return (
                                            <div key={index} className="flex w-full h-[400px] border border-white rounded-3xl p-4 gap-8">
                                                <div className='w-1/2 h-full'>
                                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover rounded-3xl" />
                                                </div>
                                                <div className="w-1/2 flex flex-col justify-between md:py-8 overflow-y-auto relative h-full">
                                                    <div className="flex-1 space-y-2">
                                                        <h3 className="md:text-xl font-bold">{service.title}</h3>
                                                        <p className="font-bold md:text-xl">{service.price_per_session}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words">{service.description}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words"><span className='font-bold'>Location:</span> {service.location}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words">{service.open_days}</p>
                                                        <p className="text-sm md:text-muted-foreground md:text-xl break-words">
                                                            <span className='font-bold'>Duration:</span> {service.duration}
                                                        </p>
                                                    </div>
                                                    <div className="sticky bottom-0 left-0 right-0 bg-black pt-2">
                                                        <button onClick={() => handleSessionBooking([{ name: 'serviceType', value: "home" }, { name: 'scheduleLocation', value: `${index == 0 ? 'mainland' : `island-${index}`}` }])} className="bg-[#A68EA5] text-primary-foreground hover:bg-primary/80 p-2 rounded transition-colors w-full">
                                                            Book Now
                                                        </button>
                                                    </div>
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