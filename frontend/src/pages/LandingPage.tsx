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
          backgroundColor: "#050505",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
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
