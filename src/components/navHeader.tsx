import React, { useEffect, useState } from 'react';
import RedMid from '@/assets/images/red.jpeg'
import Recent3 from '@/assets/images/recent3.png'
import Recent4 from '@/assets/images/recent4.png'
import Recent5 from '@/assets/images/recent5.png'
import { formatDate, formatTime } from '@/lib/tools';
import { u } from 'framer-motion/client';
export interface SessionBookingFormData {
    serviceType: string;
    scheduleDate: string;
    scheduleTime: string;
    scheduleLocation: string;
    specialRequest: string;
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    homeAddress: string;
}



export const SessionBookingModal = ({ setIsModalOpen, sessionBookingState, onClose }: { setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>, sessionBookingState?: SessionBookingFormData, onClose?: () => void }) => {

    const [step, setStep] = useState(1)
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined)
    const [isSubmitSucess, setIsSubmitSucess] = useState<boolean | undefined>(undefined)
    const [formData, setFormData] = useState<SessionBookingFormData>(sessionBookingState || {
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

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleNext = () => {
        if (step === 1) {
            const { serviceType, scheduleDate, scheduleTime } = formData
            if (!serviceType || !scheduleDate || !scheduleTime) {
                setError('Please fill in all fields')
                return
            }
            if (serviceType === 'home') {
                setStep(2);
            } else if (serviceType === 'studio') {
                setStep(3);
            } else {
                setStep(prev => Math.min(prev + 1))
            }
        }
        if (step === 2) {
            const { scheduleLocation, specialRequest } = formData
            if (!scheduleLocation || !specialRequest) {
                setError('Please fill in all fields')
                return
            }
            setStep(3);
        }

        if (step === 3) {
            const { fullName, phoneNumber, emailAddress, homeAddress } = formData
            if (!fullName || !phoneNumber || !emailAddress || !homeAddress) {
                setError('Please fill in all fields')
                return
            }
            setStep(4);
        }

        if (step === 4) {
            setStep(5);
        }

        console.log(`Step: ${step} :::: ${JSON.stringify(formData)}`)
    }
    const handleInputChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))


        const isValidEmail = (email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        if (name === 'emailAddress' && !isValidEmail(value)) {
            setError('Please enter a valid email address')
        }
        else if (name === 'phoneNumber' && !/^\d{10}$/.test(value)) {
            setError('Please enter a valid phone number')
        }
    }


    const setError = (msg: string) => {
        setErrorMsg(msg)
        setTimeout(() => {
            setErrorMsg(undefined)
        }, 5000)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        await fetch('/api/sessionBooking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
            })
            .catch(err => {
                setIsSubmitSucess(false)
                console.error(err)
            }).finally(() => {
                handleNext();
            })
    }

    const handleClose = () => {
        setIsModalOpen(false);
        onClose && onClose(); // Call the passed onClose function if it exists
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className="relative bg-white text-black rounded-2xl p-8 shadow-xl max-w-[90%] md:max-w-[50%] w-full m-4">

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <BookingImage src={Recent3.src} />
                            <div className="w-full md:w-full flex flex-col gap-6 p-8 md:px-8">
                                <div className="border-b border-black/30 pb-4">
                                    {errorMsg && (
                                        <div className="m-4 text-[#ff0000] text-sm font-semibold capitalize">
                                            {errorMsg}
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <h2 className="text-2xl font-normal">Book A Session</h2>
                                        <CloseButton onClick={handleClose} />
                                    </div>
                                    <p className="text-black/50 text-sm">Fill in the following to book a makeup appointment</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-black text-base font-semibold md:text-lg">Choose a service</label>
                                    <select value={formData.serviceType} onChange={handleInputChange} id='serviceType' name='serviceType' required className="w-full p-3 mr-9 rounded-lg font-semibold border border-black/30 focus:outline-none focus:ring-2">
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
                                            id='scheduleDate'
                                            name='scheduleDate'
                                            className="flex-1 p-3 font-semibold rounded-lg border border-black/25"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.scheduleDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="w-12 font-semibold">Time</span>
                                        <input
                                            type="time"
                                            id='scheduleTime'
                                            name='scheduleTime'
                                            step="1800"
                                            className="flex-1 p-3 font-semibold rounded-lg border border-black/25"
                                            value={formData.scheduleTime}
                                            onChange={handleInputChange}
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

                    {step === 2 && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <BookingImage src={RedMid.src} />
                            <div className="w-full md:w-full flex flex-col gap-6 p-8 md:px-8">
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
                                    <select value={formData.scheduleLocation} onChange={handleInputChange} id='scheduleLocation' name='scheduleLocation' required className="w-full p-3 mr-9 rounded-lg font-semibold border border-black/30 focus:outline-none focus:ring-2">
                                        <option value="">Select</option>
                                        <option value="mainland">{`Mainland (Yaba, Ikeja, Surulere)`}</option>
                                        <option value="island-1">{`Island (Victoria island, Ikoyi, Banana island)`}</option>
                                        <option value="island-2">{`Island ( Lekki, Ikate, Chevron)`}</option>
                                        <option value="island-3">{`Island (Ajah, Lekki garden)`}</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="specialRequest"
                                        className="block text-base font-semibold md:text-lg text-black"
                                    >
                                        Special request
                                    </label>
                                    <textarea
                                        name="specialRequest"
                                        id="specialRequest"
                                        value={formData.specialRequest}
                                        onChange={handleInputChange}
                                        rows={5}
                                        placeholder='Type a message...'
                                        className="mt-1 p-2 border border-black/30 rounded-md w-full resize-none text-black"
                                        required
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
                            <div className="w-full md:w-full flex flex-col gap-6 p-8 md:px-8">
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
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md w-full text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="emailAddress"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        name="emailAddress"
                                        id="emailAddress"
                                        value={formData.emailAddress}
                                        onChange={handleInputChange}
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
                                        value={formData.homeAddress}
                                        onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md w-full text-black"
                                        required
                                    />
                                </div>

                                <div className='z-10'>
                                    <label
                                        htmlFor="phoneNumber"
                                        className="block text-sm font-medium text-black"
                                    >
                                        Phone number
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">

                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            className="block w-full z-1 pl-20 border rounded-md py-2 pr-10 text-black"
                                            placeholder=""
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
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

                    {step === 4 && (
                        <div className="flex flex-col md:flex-row gap-6 max-h-[80vh]">
                            <BookingImage src={Recent4.src} />
                            <div className="w-full md:w-full flex flex-col gap-6 p-8 md:px-12 overflow-y-auto">
                                <div className="border-b border-black/30 pb-4">
                                    <div className="flex justify-between">
                                        <h2 className="text-2xl font-normal">Book A Session</h2>
                                        <CloseButton onClick={() => setIsModalOpen(false)} />
                                    </div>
                                    <p className="text-black/50 text-sm mt-3">Confirm that the information entered are correct, and the price for the session selected.</p>
                                </div>

                                <div className="space-y-4">
                                    {/* Service Details */}
                                    <div className="border-b border-black/20 pb-2">
                                        <div className="text-black/50">Service</div>
                                        <div className="text-black">{formData.serviceType == "studio" ? "Studio makeup session" : "Home service session"}</div>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="border-b border-black/20 pb-2">
                                        <div className="text-black/50">Date and Time</div>
                                        <div className="flex gap-2">
                                            <span>{formatDate(formData.scheduleDate)}</span>
                                            <span className="text-black/50">/</span>
                                            <span>{formatTime(formData.scheduleTime)}</span>
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div className="border-b border-black/20 pb-2">
                                        <div className="text-black/50">Full name</div>
                                        <div>{formData.fullName}</div>
                                    </div>

                                    <div className="border-b border-black/20 pb-2">
                                        <div className="text-black/50">Email address</div>
                                        <div>{formData.emailAddress}</div>
                                    </div>

                                    <div className="border-b border-black/20 pb-2">
                                        <div className="text-black/50">Phone</div>
                                        <div>{formData.phoneNumber}</div>
                                    </div>

                                    {/* Location and Price */}
                                    <div className="border-b border-black/20 pb-2">
                                        <div className="text-black/50">Location</div>
                                        <div>{formData.serviceType == "studio" ? "133 Ahmadu Bello Wy, VI, Lagos" : formData.scheduleLocation == "mainland" ? "Mainland (Yaba, Ikeja, Surulere)" : formData.scheduleLocation == "island-1" ? "Island (Victoria island, Ikoyi, Banana island)" : formData.scheduleLocation == "island-2" ? "Island (Lekki, Ikate, Chevron)" : "Island (Ajah, Lekki garden)"}</div>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-black/50">Price</span>
                                            <span className="text-black">{formData.serviceType == "studio" ? "₦ 25,000" : formData.scheduleLocation == "mainland" ? "₦ 50,000" : formData.scheduleLocation == "island-1" ? "40,000" : formData.scheduleLocation == "island-2" ? "35,000" : "40,000"}</span>
                                        </div>
                                    </div>

                                    {formData.serviceType == "home" && (
                                        <div className="space-y-2">
                                            <div className="text-black/30">Special request</div>
                                            <div className="p-2 rounded-lg border border-black/30">
                                                <p className="text-black">{formData.specialRequest}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <button type='submit' className="w-full py-3 bg-[#a68ea5] text-white rounded-lg hover:bg-[#957994] transition-colors">
                                        Book now
                                    </button>
                                    <button onClick={() => setStep(1)} className="w-full py-3 border border-black/25 text-black rounded-lg transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-full flex flex-col gap-6 p-8 md:px-8">
                                <div className="border-b border-black/30 pb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-light">Eunice</span>
                                            <span className="text-3xl font-bold">Makeover</span>
                                        </div>
                                        <CloseButton onClick={() => setIsModalOpen(false)} w='9' h='9' />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-8 py-8">
                                    {isSubmitSucess ? <div className="w-32 h-32 md:w-40 md:h-40 relative">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-full h-full text-[#a68ea5]"
                                            fill="currentColor"
                                        >
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                        </svg>
                                    </div> :
                                        <div className="w-32 h-32 md:w-40 md:h-40 relative">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-full h-full text-red-500"
                                                fill="currentColor"
                                            >
                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                            </svg>
                                        </div>}
                                    {/*  */}
                       

                                    <div className="text-center space-y-4">
                                        <h3 className={`text-2xl font-bold ${isSubmitSucess ? "text-[#a68ea5]" : "text-red-500"}`}>
                                            {isSubmitSucess ? `Booking Successful!` : `Booking Failed!`}
                                        </h3>
                                        <p className="text-base text-black/70 max-w-md">
                                            {isSubmitSucess ? ` Your booking has been sent to us. You will receive a confirmation email shortly.` : ` We couldn't process your booking at this time. Please try again or contact support.`}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        {!isSubmitSucess && (
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-8 py-3 bg-[#a68ea5] text-white rounded-lg hover:bg-[#957994] transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-8 py-3 border border-[#a68ea5] text-black rounded-lg transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
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
                    ? "bg-red shadow-lg border-b border-black"
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
                <SessionBookingModal setIsModalOpen={setIsModalOpen} />
            )}
        </>
    );
}

export default NavHeader;

const BookingImage = ({ src }: { src: string }) => (
    <div className="w-full">
        <img
            className="w-full h-40 md:h-[100%] object-cover rounded-lg"
            src={src}
            alt="Booking preview"
        />
    </div>
);

const CloseButton = ({ onClick, w = "5", h = "5" }: { onClick: () => void, w?: string, h?: string }) => (
    <button
        onClick={onClick}
        className=" hover:text-gray-700"
    >
        <svg
            className={`w-${w} h-${h}`}
            fill="none"
            stroke="#000000"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={'M6 18L18 6M6 6l12 12'}
            />
        </svg>
    </button>
);