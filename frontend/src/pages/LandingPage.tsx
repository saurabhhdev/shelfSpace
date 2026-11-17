import React from 'react';
import { OssiumNavbar } from '../components/landing/OssiumNavbar';
import { OssiumHero } from '../components/landing/OssiumHero';
import { OssiumFeatures } from '../components/landing/OssiumFeatures';
import { OssiumFAQ } from '../components/landing/OssiumFAQ';
import { OssiumCTA } from '../components/landing/OssiumCTA';
import { OssiumFooter } from '../components/landing/OssiumFooter';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", width: "100%", position: "relative" }} className="text-[#E5E5E5] selection:bg-[#09AE5B] selection:text-black">
      <div
        style={{
          position: "absolute",
          inset: "0",
          zIndex: 0,
          backgroundColor: "#000",
          backgroundImage: "repeating-linear-gradient(60deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(120deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
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
    </div>
  );
};

export default LandingPage;
