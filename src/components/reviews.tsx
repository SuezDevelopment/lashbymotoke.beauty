import { motion } from 'framer-motion';
export type CustomerReview = {
    review: string;
    name: string;
}

const CustomerReviewsSection = () => {
    const reviews: CustomerReview[] = [
        {
            review: "There’s no way i can explain to you! That makeup lasts all day",
            name: "SADE",
        },

        {
            review: "The fact that she goes everywhere for me is everything! such an amazing soul!",
            name: "TITILAYO ADEGBOYEGA",
        },

        {
            review: "I love it when i do my makeup with Eunice! she gets me!",
            name: "BEATRICE.A",
        },
        {
            review: "I love it when i do my makeup with Eunice! Its always flawless",
            name: " Normani.G",
        }
    ];
    return (
        <section className="md:px-20 p-8 bg-[#a68ea5]/10 rounded-lg flex flex-col md:flex-row justify-start items-center">
            <div className="md:border-r border-black/25 justify-center items-center md:flex">
                <div className="text-black text-base font-bold w-full leading-relaxed tracking-tight">
                    Customer Reviews
                </div>
            </div>
            {/* <>
                {Array(1)
                    .fill(null)
                    .map((_, index) => (
                        <div
                            key={index}
                            aria-hidden={index === 1}
                            className="flex min-w-full shrink-0 animate-scroll items-center justify-around gap-12"
                        >
                            {reviews.map((review, index) => {
                                return (
                                    <div className="mx-5 h-16 w-40" key={index}>
                                        <img
                                            className="h-full w-full object-contain text-black"
                                            src="assets/svgs/home-carousel/openzephilin.svg"
                                            alt="companies"
                                            width={1000}
                                            height={500}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
            </> */}
            <div className="w-full mt-2 border-t border-black/25 md:border-none justify-end items-center flex gap-2 flex overflow-hidden">
                <div
                    className="flex min-w-full shrink-0 animate-scroll items-center justify-around gap-12"
                >
                    {reviews.map((review, index) => {
                        return (
                            <div key={index} className="px-4 border-l border-black/25 justify-start items-center gap-4 flex">
                                <div className="text-center text-black text-base font-normal leading-10">
                                    {review.review}
                                </div>
                                <div className="text-center">
                                    <span className="text-black text-base font-normal leading-10">
                                        -
                                    </span>
                                    <span className="text-black/50 text-base font-bold leading-10">
                                        {review.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default CustomerReviewsSection;

