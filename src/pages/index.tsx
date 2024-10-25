import Image from "next/image";
import localFont from "next/font/local";
import NavHeader from "@/components/navHeader";
import HeroSection from "@/components/hero";
import ServicesSection from "@/components/services";
import MeSection from "@/components/me";
import CustomerReviewsSection from "@/components/reviews";
import RecentWorksSection from "@/components/recents";
import GetInTouchSection from "@/components/getintouch";
import FooterSection from "@/components/footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const geistMali = localFont({
  src: "./fonts/Mali.ttf",
  variable: "--font-geist-mali",
  weight: "100 900",
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} ${geistMali.variable} font-[family-name:var(--font-geist-mono)] md:px-12 px-2 mb-12`}
    >
       <NavHeader />
       <HeroSection />
       <ServicesSection />
       <MeSection />
       <CustomerReviewsSection />
       <RecentWorksSection />

       <GetInTouchSection />
       <FooterSection />
    </div>
  );
}
