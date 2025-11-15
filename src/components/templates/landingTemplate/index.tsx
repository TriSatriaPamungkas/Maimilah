// src/components/landing/index.tsx
import HeroSection from "./heroSection";
import Introduction from "./introduction";
import EventHighlight from "./eventHighlight";
import MerchHighlight from "./MerchHighlight";
import CTASection from "./ctaSection";
import Navbar from "../../organism/navbar";
import Footer from "./footerSection";

const LandingPage = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <Introduction />
      <EventHighlight />
      <MerchHighlight />
      <CTASection />
      <Footer />
    </main>
  );
};

export default LandingPage;
