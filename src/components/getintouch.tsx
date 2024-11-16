import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { BsEnvelopePaper } from 'react-icons/bs';
import { FaFacebookSquare } from 'react-icons/fa';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import { PiSpinner } from 'react-icons/pi';
import { GoLocation } from 'react-icons/go';

interface GetInTouchFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

const GetInTouchSection = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>()
  const [successMsg, setSuccessMsg] = useState<string>()
  const [formData, setFormData] = useState<GetInTouchFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    const { firstName, lastName, email, phone, message } = formData
    if (firstName && lastName && email && phone && message) {
      setIsLoading(true);

      fetch('/api/letsTalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then((response) => response.json()).then(data => {
        setIsLoading(false);
        if (data.status) {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            message: '',
          });

          setSuccessMsg(data.message);
          setTimeout(() => {
            setSuccessMsg(undefined);
          }, 2000);

        } else {
          setErrorMsg(data.message);
          setTimeout(() => {
            setErrorMsg(undefined);
          }, 2000);
        }
      })
    } else {
      setErrorMsg("All fields are required!");
      setTimeout(() => {
        setErrorMsg(undefined);
      }, 2000);
    }
  };

  return (
    <section className="my-12 px-6 sm:px-8 lg:px-20" id="contact">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center items-start gap-6">
            <div className="px-6 py-2.5 border-l-8 border-black">
              <h2 className="text-xl font-bold text-black leading-loose">
                GET IN TOUCH
              </h2>
            </div>
            <p className="text-black/50 text-base font-normal leading-relaxed tracking-tight">
              Have a question or would you like to book an appointment? Drop me a
              message and I'll get back to you as soon as possible.
            </p>

            <div className="email socials flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BsEnvelopePaper color='black' size={24} />
                <a href="mailto:contact@eunicemakeover.com.ng" className="text-black text-base font-normal leading-relaxed tracking-tight hover:underline">
                  contact@eunicemakeover.com.ng
                </a>
              </div>
              <div className="flex items-center gap-2">
                <GoLocation color='black' size={24} />
                <a
                  href="https://maps.google.com/?q=133+Ahmadu+Bello+Way+Victoria+Island+Lagos+106104"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black text-base font-normal leading-relaxed tracking-tight hover:underline"
                >
                  133 Ahmadu Bello Wy, VI, Lagos
                </a>
              </div>

              <div className="flex items-center gap-4 cursor-pointer">
                <a href="https://www.instagram.com/unice_makeover_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                  <FaInstagram color='black' size={24} />
                </a>
                <a href="https://wa.me/message/NXQ34HB55DEII1" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp color='black' size={24} />
                </a>
                <a href="https://www.facebook.com/oyekan.eunice.1?mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer">
                  <FaFacebookSquare color='black' size={24} />
                </a>
              </div>
            </div>
          </div>
          <div className="bg-[#f9f9f9] rounded-2xl sm:ml-[9rem] shadow p-6 max-w-[30rem]">
            <div className="mb-6">
              <h3 className="text-2xl font-normal text-black leading-loose">
                Let’s Talk
              </h3>
              <p className="text-black/50 text-base font-normal leading-relaxed tracking-tight">
                Kindly fill up the input fields to send me a message! I’ll get
                back to you as soon as possible.
              </p>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="m-4 text-[#ff0000] text-sm font-semibold capitalize">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="m-4 text-green-500 text-center text-sm font-semibold capitalize">
                  {successMsg}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border rounded-md w-full text-black"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border rounded-md w-full text-black"
                    required
                  />
                </div>
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
                  value={formData.email}
                  onChange={handleInputChange}
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
                <div className="mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4">
                    <span className="text-gray-500 sm:text-sm"></span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="block w-full z-1 pl-14 border rounded-md py-2 pr-10 text-black"
                    placeholder=""
                    prefix=""
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    max={11}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-black"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  className="mt-1 p-2 border rounded-md w-full resize-none text-black"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="bg-[#a68ea5] text-white font-bold py-2 px-4 rounded-lg"
              >
                {isLoading ? (
                  <motion.span
                    animate={{ rotate: 360, transition: { duration: 1, repeat: Infinity } }}
                    className="inline-block"
                  >
                    <PiSpinner className="animate-spin h-6 w-6 text-white" />
                  </motion.span>
                ) : ("Send message")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouchSection;

