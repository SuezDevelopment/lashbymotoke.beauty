import { motion } from 'framer-motion';
import React, { useState } from 'react';


const PricingSection = () => {
    return (
        <section id='pricing' className="px-4 bg-black sm:px-8 lg:px-20 py-16 w-full">
            <motion.div
                className="flex flex-col justify-start items-start gap-24 inline-flex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="text-7xl sm:text-8xl md:text-9xl font-bold leading-10">
                    PRICING
                </div>
                <div className="flex flex-col justify-center items-start gap-6 w-full">
                    <div className="p-4 rounded-2xl border border-white justify-between items-center inline-flex w-full relative">
                        <div className="flex justify-start items-center gap-6">
                            <div className="text-base font-normal leading-relaxed tracking-tight">
                                1.
                            </div>
                            <div className="text-base font-normal leading-relaxed tracking-tight">
                                Studio makeup session
                            </div>
                        </div>
                        <div className="cursor-pointer">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                            <div className="absolute top-full left-0 w-full bg-black rounded-2xl shadow-lg hidden">
                                <div className="p-2">
                                    <p className="text-white text-sm">Dropdown content</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white justify-between items-center inline-flex w-full">
                        <div className="flex justify-start items-center gap-6">
                            <div className="text-base font-normal leading-relaxed tracking-tight">
                                2.
                            </div>
                            <div className="text-base font-normal leading-relaxed tracking-tight">
                                Home service makeup session
                            </div>
                            <div className="cursor-pointer">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                                <div className="absolute top-full left-0 w-full bg-black rounded-2xl shadow-lg hidden">
                                    <div className="p-2">
                                        <p className="text-white text-sm">Dropdown content</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

export default PricingSection;