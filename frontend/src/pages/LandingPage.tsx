import React, { useState } from 'react';
import { OssiumNavbar } from '../components/landing/OssiumNavbar';
import { OssiumHero } from '../components/landing/OssiumHero';
import { OssiumFeatures } from '../components/landing/OssiumFeatures';
import { OssiumFAQ } from '../components/landing/OssiumFAQ';
import { OssiumCTA } from '../components/landing/OssiumCTA';
import HalftoneWordmarkFooter from '../components/landing/HalftoneWordmarkFooter';
import { ProductTourModal } from '../components/landing/ProductTourModal';

export const LandingPage: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div
      style={{ minHeight: '100vh', width: '100%', position: 'relative' }}
      className="flex flex-col justify-between bg-[#262624] text-[#FAF9F5] selection:bg-[#D97757] selection:text-white"
    >
      {/* Dotted Structure Background Layer (Preserves #262624 theme intact) */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translate(0px, 0px) rotate(0deg) scale(1)',
          backgroundBlendMode: 'overlay',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.13) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ossium Sticky/Fixed Navbar */}
      <OssiumNavbar />

      <main className="relative z-10 flex-1">
        {/* Ossium Hero with Showcase Frame */}
        <OssiumHero onExploreClick={() => setIsTourOpen(true)} />

        {/* 6-Tab Interactive Core Features & Secondary Grid */}
        <OssiumFeatures />

        {/* Frequently Asked Questions Accordion */}
        <OssiumFAQ />

        {/* Bottom Hero Call To Action Frame */}
        <OssiumCTA />
      </main>

      {/* Halftone Wordmark Interactive Footer */}
      <HalftoneWordmarkFooter />

      {/* Interactive Product Tour Modal */}
      <ProductTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
};

export default LandingPage;
