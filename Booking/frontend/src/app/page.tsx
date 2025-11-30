import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import ServicesShowcase from '@/components/home/ServicesShowcase';
import PortfolioGallery from '@/components/home/PortfolioGallery';
import Testimonials from '@/components/home/Testimonials';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#1a1a1a]">
      <HeroSection />
      <ServicesShowcase />
      <PortfolioGallery />
      <StatsBar />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
