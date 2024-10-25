const GetInTouchSection = () => {
    return (
      <section className="my-12 px-6 sm:px-8 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center items-start gap-6">
              <div className="px-6 py-2.5 border-l-8 border-black">
                <h2 className="text-xl font-normal text-black leading-loose">
                  GET IN TOUCH
                </h2>
              </div>
              <p className="text-black/50 text-base font-normal leading-relaxed tracking-tight">
                Have a question or would you like to book an appointment? Drop me a
                message and I'll get back to you as soon as possible.
              </p>
            </div>
            <div className="bg-[#f9f9f9] rounded-2xl shadow p-6 max-w-[30rem]">
              <div className="mb-6">
                <h3 className="text-2xl font-normal text-black leading-loose">
                  Let’s Talk
                </h3>
                <p className="text-black/50 text-base font-normal leading-relaxed tracking-tight">
                  Kindly fill up the input fields to send me a message! I’ll get
                  back to you as soon as possible.
                </p>
              </div>
              <form className="flex flex-col gap-6">
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
                      className="mt-1 p-2 border rounded-md w-full text-black"
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
                      className="mt-1 p-2 border rounded-md w-full text-black"
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
                    className="mt-1 p-2 border rounded-md w-full text-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-black"
                  >
                    Phone number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-4">
                      <span className="text-gray-500 sm:text-sm">+234</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className="block w-full pl-14 border rounded-md py-2 pr-10 text-black"
                      placeholder=""
                      prefix="+234"
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
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#a68ea5] text-white font-bold py-2 px-4 rounded-lg"
                >
                  Send message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default GetInTouchSection;
  
  