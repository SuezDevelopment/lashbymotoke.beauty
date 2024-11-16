import React, { useEffect, useState } from 'react';
import RedMid from '@/assets/images/red.jpeg'
import Recent3 from '@/assets/images/recent3.png'
interface SessionBookingFormData {
    serviceType: string;
    scheduleDate: string;
    scheduleTime: string;
    fullname: string;
}



const NavHeader = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {

            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full rounded-lg shadow-lg px-4 py-4 sm:px-8 lg:px-20 flex items-center justify-between z-20 ${isScrolled
                    ? "bg-red shadow-lg border-b border-red-300"
                    : "bg-transparent shadow-lg border-b border-gray-300"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-light text-black leading-loose">
                        Eunice
                    </span>
                    <span className="text-xl font-normal text-black font-['Lato'] leading-loose">
                        {' '}
                    </span>
                    <span className="text-3xl font-bold text-black leading-loose">
                        Makeover
                    </span>
                </div>
                <div className="lg:flex items-center gap-4 hidden">
                    <a
                        href="#pricing"
                        className="text-base font-normal text-black leading-relaxed tracking-tight"
                    >
                        Pricing
                    </a>
                    <span className="text-black/20 text-base font-light leading-relaxed tracking-tight">
                        /
                    </span>
                    <a
                        href="#services"
                        className="text-base font-normal text-black leading-relaxed tracking-tight"
                    >
                        Services
                    </a>
                    <span className="text-black/20 text-base font-light leading-relaxed tracking-tight">
                        /
                    </span>
                    <a
                        href="#contact"
                        className="text-base font-normal text-black leading-relaxed tracking-tight"
                    >
                        Contact us
                    </a>
                </div>
                <button onClick={() => {
                    setIsModalOpen(true);
                    console.log("setIsModalOpen(true)"
                    );
                }} className="h-10 px-4 rounded-2xl border border-black/25 text-black text-base font-normal leading-relaxed tracking-tight lg:inline-block hidden">
                    Book a session
                </button>
                <button
                    className="lg:hidden"
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen)
                    }}
                >
                    <svg
                        className="w-9 h-9"
                        fill="none"
                        stroke="#000000"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                                isMenuOpen
                                    ? 'M6 18L18 6M6 6l12 12'
                                    : 'M4 6h16M4 12h16m-7 6h7'
                            }
                        />
                    </svg>
                </button>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden absolute top-full z-20 left-0 w-full bg-white shadow-md rounded-md mt-2">
                        <ul className="py-4 px-6 space-y-4">
                            <li>
                                <a
                                    href="#pricing"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-base font-normal text-black leading-relaxed tracking-tight block text-center"
                                >
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#services"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-base font-normal text-black leading-relaxed tracking-tight block text-center"
                                >
                                    Services
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-base font-normal text-black leading-relaxed tracking-tight block text-center"
                                >
                                    Contact us
                                </a>
                            </li>
                            <li>
                                <button onClick={() => {
                                    setIsModalOpen(true); setIsMenuOpen(false);
                                }} className="h-10 px-4 rounded-2xl border border-black/25 text-black text-base font-normal leading-relaxed tracking-tight w-full">
                                    Book a session
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>

            {isModalOpen && (
                <SessionBookingModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
            )}
        </>
    );
}

export default NavHeader;

export const SessionBookingModal = ({ setIsModalOpen, isModalOpen }: any) => {

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<SessionBookingFormData>({
        serviceType: '',
        scheduleDate: '',
        scheduleTime: '',
        fullname: '',
    })

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleNext = () => {
        if (step === 1) {
            const { serviceType, scheduleDate, scheduleTime } = formData
            if (!serviceType || !scheduleDate || !scheduleTime) {
                alert('Please fill in all fields')
                return
            }
        }
        if (step === 2) {}
        setStep(prev => Math.min(prev + 1, 3))
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white text-black rounded-2xl p-8 shadow-xl max-w-[90%] md:max-w-[50%] w-full m-4">
                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <BookingImage src={Recent3.src} />
                            <div className="w-full md:w-full flex flex-col gap-6 md:p-8 md:px-8">
                                <div className="border-b border-black/30 pb-4">
                                    <div className="flex justify-between">
                                        <h2 className="text-2xl font-normal">Book A Session</h2>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className=" hover:text-gray-700"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="#000000"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={
                                                        'M6 18L18 6M6 6l12 12'
                                                    }
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-black/50 text-sm">Fill in the following to book a makeup appointment</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-black text-base font-semibold md:text-lg">Choose a service</label>
                                    <select required className="w-full p-3 mr-9 rounded-lg font-semibold border border-black/30 focus:outline-none focus:ring-2">
                                        <option value="">Select</option>
                                        <option value="studio">Studio makeup session</option>
                                        <option value="home">Home service</option>
                                    </select>
                                </div>

                                <div className="p-4 rounded-lg border border-black/25 space-y-4">
                                    <div className="pb-2 border-b border-black/20">
                                        <h3 className="text-base font-semibold md:text-lg">Date and Time</h3>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="w-12 font-semibold">On</span>
                                        <input
                                            type="date"
                                            className="flex-1 p-3 font-semibold rounded-lg border border-black/25"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="w-12 font-semibold">Time</span>
                                        <input
                                            type="time"
                                            className="flex-1 p-3 font-semibold rounded-lg border border-black/25"
                                            required
                                        />
                                    </div>
                                </div>

                                <button onClick={() => handleNext()} className="w-full py-3 bg-[#a68ea5] font-semibold text-white rounded-lg hover:bg-[#957994] transition-colors">
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && formData.serviceType === 'home' && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <BookingImage src={Recent3.src} />
                            <div className="w-full md:w-full flex flex-col gap-6 md:p-8 md:px-8">
                                <div className="border-b border-black/30 pb-4">
                                    <div className="flex justify-between">
                                        <h2 className="text-2xl font-normal">Book A Session</h2>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className=" hover:text-gray-700"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="#000000"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={
                                                        'M6 18L18 6M6 6l12 12'
                                                    }
                                                />
                                            </svg>
                                        </button>

                                    </div>
                                    <p className="text-black/50 text-sm">Fill in the following to book a makeup appointment</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-black text-base font-semibold md:text-lg">Pick a location</label>
                                    <select required className="w-full p-3 mr-9 rounded-lg font-semibold border border-black/30 focus:outline-none focus:ring-2">
                                        <option value="">Select</option>
                                        <option value="mainland">{`Mainland (Yaba, Ikeja, Surulere)`}</option>
                                        <option value="island-1">{`Island (Victoria island, Ikoyi, Banana island)`}</option>
                                        <option value="island-2">{`Island ( Lekki, Ikate, Chevron)`}</option>
                                        <option value="island-3">{`Island (Ajah, Lekki garden)`}</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-base font-semibold md:text-lg text-black"
                                    >
                                        Special request
                                    </label>
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows={5}
                                        placeholder='Type a message...'
                                        className="mt-1 p-2 border border-black/30 rounded-md w-full resize-none text-black"
                                        required
                                    //   value={formData.message}
                                    //   onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleNext()} className="w-full py-3 bg-[#a68ea5] font-semibold text-white rounded-lg hover:bg-[#957994] transition-colors">
                                        Continue
                                    </button>
                                    <button onClick={() => handleBack()} className="w-full py-3 border border-[#a68ea5] font-semibold text-black rounded-lg transition-colors">
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <BookingImage src={Recent3.src} />
                            <div className="w-full md:w-full flex flex-col gap-6 md:p-8 md:px-8">
                                <div className="border-b border-black/30 pb-4">
                                    <div className="flex justify-between">
                                        <h2 className="text-2xl font-normal">Book A Session</h2>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className=" hover:text-gray-700"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="#000000"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={
                                                        'M6 18L18 6M6 6l12 12'
                                                    }
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-black/50 text-sm">Fill in the following to book a makeup appointment</p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="fullName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Full name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        // value={formData.fullName}
                                        // onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md w-full text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        // value={formData.email}
                                        // onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md w-full text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="homeAddress"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Home address
                                    </label>
                                    <input
                                        type=""
                                        name="homeAddress"
                                        id="homeAddress"
                                        // value={formData.fullName}
                                        // onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md w-full text-black"
                                        required
                                    />
                                </div>

                                <div className='z-10'>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-black"
                                    >
                                        Phone number
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-4 border border-r-2">
                                            <span className="text-gray-500 sm:text-sm">+234</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            className="block w-full z-1 pl-20 border rounded-md py-2 pr-10 text-black"
                                            placeholder=""
                                            prefix="+234"
                                            // value={formData.phone}
                                            // onChange={handleInputChange}
                                            required
                                            max={11}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleNext()} className="w-full py-3 bg-[#a68ea5] font-semibold text-white rounded-lg hover:bg-[#957994] transition-colors">
                                        Continue
                                    </button>
                                    <button onClick={() => handleBack()} className="w-full py-3 border border-[#a68ea5] font-semibold text-black rounded-lg transition-colors">
                                        Back
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 4 && (<></>)}
                </form>
            </div>
        </div>
    );
}

const BookingImage = ({ src }: { src: string }) => (
    <div className="w-full md:w-1/2">
        <img
            className="w-full h-40 md:h-[100%] object-cover rounded-lg"
            src={src}
            alt="Booking preview"
        />
    </div>
);