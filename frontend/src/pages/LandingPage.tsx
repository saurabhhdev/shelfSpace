import React from 'react';
import { OssiumNavbar } from '../components/landing/OssiumNavbar';
import { OssiumHero } from '../components/landing/OssiumHero';
import { OssiumFeatures } from '../components/landing/OssiumFeatures';
import { OssiumFAQ } from '../components/landing/OssiumFAQ';
import { OssiumCTA } from '../components/landing/OssiumCTA';
import { OssiumFooter } from '../components/landing/OssiumFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0E0F10] text-[#E5E5E5] relative selection:bg-[#09AE5B] selection:text-black">
      {/* Ossium Sticky/Fixed Navbar */}
      <OssiumNavbar />

      <main>
        {/* Ossium Hero with Showcase Frame */}
        <OssiumHero />

        {/* 6-Tab Interactive Core Features & Secondary Grid */}
        <OssiumFeatures />

        {/* Frequently Asked Questions Accordion */}
        <OssiumFAQ />

        {/* Call to Action Frame */}
        <OssiumCTA />
      </main>

      {/* 5-Column Footer */}
      <OssiumFooter />
    </div>
  );
};

export default LandingPage;
