import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

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
    <section id="faq" className="py-24 bg-[#0E0F10] border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#E5E5E5]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#8E8E93]">
            Everything you need to know about Shelfspace and how it organizes your workflow.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-none border border-white/[0.06] bg-[#121316] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#E5E5E5]">
                    {faq.q}
                  </span>
                  <div className="p-1 rounded-none bg-white/[0.04] text-neutral-400 shrink-0">
                    {isOpen ? <Minus className="w-4 h-4 text-[#09AE5B]" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[#8E8E93] leading-relaxed border-t border-white/[0.04] pt-3">
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
