import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import ServicesShowcase from '@/components/home/ServicesShowcase';
import PortfolioGallery from '@/components/home/PortfolioGallery';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import FinalCTA from '@/components/home/FinalCTA';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsBar />
      <ServicesShowcase />
      <PortfolioGallery />
      <WhyChooseUs />
      <FinalCTA />
    </div>
  );
}
