import React, { useState } from 'react';
import { OssiumNavbar } from '../components/landing/OssiumNavbar';
import { OssiumHero } from '../components/landing/OssiumHero';
import { OssiumFeatures } from '../components/landing/OssiumFeatures';
import { OssiumFAQ } from '../components/landing/OssiumFAQ';
import { OssiumCTA } from '../components/landing/OssiumCTA';
import { OssiumFooter } from '../components/landing/OssiumFooter';
import { ProductTourModal } from '../components/landing/ProductTourModal';

export const LandingPage: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#262624] text-[#FAF9F5] relative selection:bg-[#D97757] selection:text-white">
      {/* Ossium Sticky/Fixed Navbar */}
      <OssiumNavbar />

      <main className="relative z-10">
        {/* Ossium Hero with Showcase Frame */}
        <OssiumHero onExploreClick={() => setIsTourOpen(true)} />

        {/* 6-Tab Interactive Core Features & Secondary Grid */}
        <OssiumFeatures />

        {/* Frequently Asked Questions Accordion */}
        <OssiumFAQ />

        {/* Call to Action Frame */}
        <OssiumCTA onExploreClick={() => setIsTourOpen(true)} />
      </main>

      {/* 5-Column Footer */}
      <OssiumFooter />

      {/* Interactive Product Tour Modal */}
      <ProductTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
};

export default LandingPage;
