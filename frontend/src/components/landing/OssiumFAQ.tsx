import React, { useState } from 'react';
import { Flaticon } from '../ui/Flaticon';

export const OssiumFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
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
