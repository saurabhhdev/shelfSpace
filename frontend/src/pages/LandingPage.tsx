import React from 'react';
import { OssiumNavbar } from '../components/landing/OssiumNavbar';
import { OssiumHero } from '../components/landing/OssiumHero';
import { OssiumFeatures } from '../components/landing/OssiumFeatures';
import { OssiumFAQ } from '../components/landing/OssiumFAQ';
import { OssiumCTA } from '../components/landing/OssiumCTA';
import { OssiumFooter } from '../components/landing/OssiumFooter';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", width: "100%", position: "relative" }} className="bg-[#000] text-[#E5E5E5] selection:bg-[#09AE5B] selection:text-black">
      <div
        style={{
          position: "absolute",
          inset: "0",
          zIndex: 0,
          background: "#000",
          opacity: "1",
          filter: "blur(0px)",
          transform: "translate(0px, 0px) rotate(0deg) scale(1)",
          backgroundBlendMode: "overlay",
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
