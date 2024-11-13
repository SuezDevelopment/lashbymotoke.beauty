import React, { useEffect, useState } from 'react';

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

    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<SessionBookingFormData>({
        serviceType: '',
        scheduleDate: '',
        scheduleTime: '',
        fullname: '',
    })

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
                                    setIsModalOpen(true); console.log("setIsModalOpen(true)");
                                }} className="h-10 px-4 rounded-2xl border border-black/25 text-black text-base font-normal leading-relaxed tracking-tight w-full">
                                    Book a session
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>

            {isModalOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative bg-white text-black rounded-2xl p-8 shadow-xl max-w-[80%] w-full m-4">
                        <h2 className="text-2xl font-bold mb-4">Book Your Session</h2>
                        {/* Add your booking form or content here */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default NavHeader;