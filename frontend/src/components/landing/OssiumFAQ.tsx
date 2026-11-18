import React, { useState } from 'react';
import { Flaticon } from '../ui/Flaticon';

export const OssiumFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How is Shelfspace different from normal browser bookmarks?',
      a: 'Browser bookmarks become cluttered dumping grounds scattered across devices. Shelfspace provides structured taxonomy, live URL status checks, multi-dimensional tags, in-memory fuzzy search, and project binders that you can search from any browser or device.'
    },
    {
      q: 'Does Shelfspace automatically scrape metadata and favicons?',
      a: 'Yes. When you paste any URL or repository, Shelfspace queries the open graph tags, title, description, and high-resolution favicon to give you a clean, previewable card instantly.'
    },
    {
      q: 'Can I export my data or migrate out at any time?',
      a: 'Absolutely. We believe in zero vendor lock-in. You can export your entire resource catalog, tags, notes, and collections to Markdown or clean JSON with a single click.'
    },
    {
      q: 'Is there a keyboard shortcut for fast navigation?',
      a: 'Yes! Press ⌘K (or Ctrl+K on Windows) from anywhere to open the global command palette. You can search resources, filter tags, jump to collections, or trigger quick additions without leaving the keyboard.'
    },
    {
      q: 'Is Shelfspace free to use?',
      a: 'Shelfspace offers a generous free tier that includes unlimited bookmarks, tags, and collections for individual developers, with optional team workspace upgrades.'
    }
  ];

  return (
    <section id="faq" className="py-24 sm:py-28 bg-transparent border-t border-[#3E3E38]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] leading-relaxed max-w-xl mx-auto">
            Everything you need to know about Shelfspace and how it organizes your workflow.
          </p>
        </div>

        {/* Clean Editorial Accordion with Thin Horizontal Dividers */}
        <div className="border-t border-[#3E3E38] divide-y divide-[#3E3E38]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="transition-colors">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-5 sm:py-6 flex items-center justify-between text-left gap-4 cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-base sm:text-lg font-medium transition-colors ${
                      isOpen ? 'text-[#FAF9F5]' : 'text-[#FAF9F5]/90 group-hover:text-white'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span className="shrink-0 flex items-center justify-center w-6 h-6 text-neutral-400 group-hover:text-white transition-colors">
                    {isOpen ? (
                      <Flaticon name="minus" className="text-xs text-[#D97757]" />
                    ) : (
                      <Flaticon name="plus" className="text-xs" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-6 text-sm sm:text-base text-[#B7B5A9] leading-relaxed pr-6 sm:pr-8 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
