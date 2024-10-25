const FooterSection = () => {
    const currentYear = new Date().getFullYear();
  return (
    <footer className="py-4 bg-[#a68ea5]/10"> 
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-black text-base font-normal leading-relaxed tracking-tight mb-2 sm:mb-0">
          &copy; {currentYear} Eunicemakeover
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-black text-base font-normal leading-relaxed tracking-tight">
            Privacy policy
          </a>
          <span className="text-black/20 text-base font-light leading-relaxed tracking-tight hidden sm:block">
            |
          </span>
          <a href="#" className="text-black text-base font-normal leading-relaxed tracking-tight">
            Terms & conditions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;