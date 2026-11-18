import React, { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

export const OssiumFAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-0');

  const faqs: FAQItem[] = [
    {
      q: 'What is Shelfspace and what can I save in it?',
      a: 'Shelfspace is a focused workspace for developers and creators. You can save developer tools, GitHub repositories, UI components, documentation, articles, and design references — keeping everything organized and easily searchable in one place.'
    },
    {
      q: 'How is Shelfspace different from normal browser bookmarks?',
      a: 'Browser bookmarks quickly become disorganized and stay locked to a single browser. Shelfspace provides rich link previews, custom tags, project-based collections, and instant global search that you can access from any browser or device.'
    },
    {
      q: 'Do I have to type out details manually when adding a link?',
      a: 'No. Just paste a URL or repository link, and Shelfspace automatically fetches the page title, description, preview image, and favicon. You can review and tweak the details before saving.'
    },
    {
      q: 'Can I organize resources by projects?',
      a: 'Yes. You can create dedicated projects and link any resource to them. A single tool or library can be used across multiple projects without duplicating records.'
    },
    {
      q: 'How quickly can I find saved resources later?',
      a: 'Instantly. Shelfspace includes fast full-text search across titles, descriptions, and tags, as well as category filters and a quick command palette (⌘K or Ctrl+K) to jump to any resource within seconds.'
    },
    {
      q: 'Can I export my data or migrate out at any time?',
      a: 'Absolutely. We believe in zero vendor lock-in. You can export your entire catalog of resources, collections, tags, and notes to clean JSON or Markdown at any time with a single click.'
    },
    {
      q: 'Can I import my existing bookmarks from my browser?',
      a: 'Yes. You can import existing bookmarks exported from Chrome, Brave, Safari, or Firefox. Shelfspace parses your bookmark files and converts them into structured resource cards.'
    },
    {
      q: 'Does Shelfspace work on mobile devices?',
      a: 'Yes. Shelfspace is built with a responsive mobile-first interface, allowing you to search, view, and organize your resource library seamlessly from your phone, tablet, or desktop.'
    },
    {
      q: 'Can I customize categories and tag colors?',
      a: 'Yes. You can create custom categories, assign multi-colored tags, and star important resources as favorites so your most critical tools and repos are always one click away.'
    },
    {
      q: 'Is Shelfspace free and open source?',
      a: 'Yes, Shelfspace is free to use and open source under the MIT License. All core features — unlimited resources, categories, tags, and projects — are available without hidden fees.'
    }
  ];

  // Group into pairs for 2-column grid: 5 rows of [left, right]
  const rows: [FAQItem, FAQItem][] = [];
  for (let i = 0; i < faqs.length; i += 2) {
    rows.push([faqs[i], faqs[i + 1]]);
  }

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-24 sm:py-28 bg-transparent border-t border-[#3E3E38]/50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight font-sans">
            Frequently Asked Questions
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] leading-relaxed max-w-xl mx-auto">
            Everything you need to know about Shelfspace and how it organizes your workflow.
          </p>
        </div>

        {/* Technical Blueprint Grid with Dashed Borders & Corner Crosshairs */}
        <div className="relative border-t border-dashed border-[#3E3E38]/80">
          {rows.map(([left, right], rowIndex) => {
            const leftId = `faq-${rowIndex * 2}`;
            const rightId = `faq-${rowIndex * 2 + 1}`;
            const isLeftOpen = openId === leftId;
            const isRightOpen = openId === rightId;

            return (
              <div
                key={rowIndex}
                className="relative border-b border-dashed border-[#3E3E38]/80 grid grid-cols-1 md:grid-cols-2"
              >
                {/* Crosshairs (+) at row top-left, center, and right */}
                <span className="absolute -top-[7px] -left-[5px] text-[#706F68] font-mono text-xs leading-none select-none z-10 pointer-events-none">
                  +
                </span>
                <span className="hidden md:block absolute -top-[7px] left-1/2 -translate-x-1/2 text-[#706F68] font-mono text-xs leading-none select-none z-10 pointer-events-none">
                  +
                </span>
                <span className="absolute -top-[7px] -right-[5px] text-[#706F68] font-mono text-xs leading-none select-none z-10 pointer-events-none">
                  +
                </span>

                {/* Left Cell */}
                <div
                  className={`relative p-5 sm:p-6 transition-colors md:border-r border-dashed border-[#3E3E38]/80 ${
                    isLeftOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(leftId)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                    aria-expanded={isLeftOpen}
                  >
                    <span
                      className={`text-sm sm:text-base font-semibold tracking-tight transition-colors ${
                        isLeftOpen ? 'text-[#FAF9F5]' : 'text-[#FAF9F5]/90 group-hover:text-white'
                      }`}
                    >
                      {left.q}
                    </span>
                    <svg
                      className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                        isLeftOpen ? 'rotate-180 text-[#D97757]' : 'group-hover:text-white'
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isLeftOpen && (
                    <div className="mt-3.5 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed pr-2 animate-fade-in">
                      {left.a}
                    </div>
                  )}
                </div>

                {/* Right Cell */}
                <div
                  className={`relative p-5 sm:p-6 transition-colors border-t md:border-t-0 border-dashed border-[#3E3E38]/80 ${
                    isRightOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(rightId)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                    aria-expanded={isRightOpen}
                  >
                    <span
                      className={`text-sm sm:text-base font-semibold tracking-tight transition-colors ${
                        isRightOpen ? 'text-[#FAF9F5]' : 'text-[#FAF9F5]/90 group-hover:text-white'
                      }`}
                    >
                      {right.q}
                    </span>
                    <svg
                      className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                        isRightOpen ? 'rotate-180 text-[#D97757]' : 'group-hover:text-white'
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isRightOpen && (
                    <div className="mt-3.5 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed pr-2 animate-fade-in">
                      {right.a}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bottom-most Crosshairs (+) */}
          <div className="relative h-0">
            <span className="absolute -top-[7px] -left-[5px] text-[#706F68] font-mono text-xs leading-none select-none z-10 pointer-events-none">
              +
            </span>
            <span className="hidden md:block absolute -top-[7px] left-1/2 -translate-x-1/2 text-[#706F68] font-mono text-xs leading-none select-none z-10 pointer-events-none">
              +
            </span>
            <span className="absolute -top-[7px] -right-[5px] text-[#706F68] font-mono text-xs leading-none select-none z-10 pointer-events-none">
              +
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OssiumFAQ;
