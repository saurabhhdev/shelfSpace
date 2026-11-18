import React from 'react';
import { Flaticon } from '../ui/Flaticon';

export const OssiumFeatures: React.FC = () => {
  // 1. What You Can Do — Three Core Benefit Blocks
  const benefits = [
    {
      number: '01',
      title: 'Keep Everything Together',
      description:
        "You run into great repos, UI kits, libraries, and code snippets all over the web. Shelfspace gives you one place to save them, so you don't have to go digging through your browser history or star list later.",
      iconName: 'apps',
    },
    {
      number: '02',
      title: 'Organize Around Your Projects',
      description:
        'Create a dedicated workspace for each thing you are building and group the relevant packages, docs, and references inside it. When you return to that codebase, everything you relied on is already there.',
      iconName: 'folder',
    },
    {
      number: '03',
      title: 'Find What You Need Faster',
      description:
        'Filter by category, search by tag, or star your go-to references for quick access. You can pull up the exact resource you saved in seconds without paging through a messy list.',
      iconName: 'search',
    },
  ];

  // 2. Small Features Section — Six Compact Items
  const features = [
    {
      title: 'Resource Collection',
      description:
        'Bookmark repositories, UI components, helpful articles, and snippets so your personal developer toolkit stays in one spot.',
      iconName: 'boxes',
    },
    {
      title: 'Project Organization',
      description:
        'Set up projects and attach the exact libraries and references you need for each build, keeping them separate and tidy.',
      iconName: 'folder-open',
    },
    {
      title: 'Smart Auto Add',
      description:
        'Paste a link, and Shelfspace grabs the title, summary, and preview image for you. Check over the details and save with one click.',
      iconName: 'sparkles',
    },
    {
      title: 'Auto Categorization & Tags',
      description:
        'Get automatic tag and category suggestions based on the link you provide, with full control to tweak them whenever you want.',
      iconName: 'tags',
    },
    {
      title: 'Quick Search & Filters',
      description:
        'Find what you are looking for by typing a keyword, or narrow down items by format, tags, and custom categories.',
      iconName: 'settings-sliders',
    },
    {
      title: 'Favorites',
      description:
        'Star the everyday utilities and cheatsheets you use constantly so they stay pinned right at the top of your library.',
      iconName: 'star',
    },
  ];

  return (
    <div className="relative bg-transparent">
      {/* =========================================================================
          SECTION 1: WHAT YOU CAN DO
          3-Column Editorial Layout (No Boxed Cards)
         ========================================================================= */}
      <section id="what-you-can-do" className="py-20 sm:py-28 border-t border-[#3E3E38] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              What You Can Do
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] leading-relaxed">
              Keep the things you find useful close to the things you build.
            </p>
          </div>

          {/* 3 Editorial Columns with Top Rule Separators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            {benefits.map((item) => (
              <div
                key={item.number}
                className="flex flex-col justify-between pt-6 border-t border-[#3E3E38]"
              >
                <div>
                  {/* Top Meta: Numeral and Minimal Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-xs font-semibold text-[#D97757] tracking-wider">
                      {item.number}
                    </span>
                    <span className="text-neutral-500">
                      <Flaticon name={item.iconName} className="text-xs" />
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg sm:text-xl font-semibold text-[#FAF9F5] tracking-tight mb-3">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#B7B5A9] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURES SECTION
          Open 3x2 Editorial Grid with Subtle Row Dividers (No Individual Cards)
         ========================================================================= */}
      <section id="features" className="py-20 sm:py-28 border-t border-[#3E3E38] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              Built to Keep You Organized
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] leading-relaxed">
              Everything you need to manage your developer resources, without the unnecessary complexity.
            </p>
          </div>

          {/* 6 Features - Clean Open Grid with Top Hairline Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 lg:gap-x-12 lg:gap-y-14">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col justify-start pt-6 border-t border-[#3E3E38]/80 group"
              >
                {/* Icon & Title Alignment */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-md bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center text-[#D97757] shrink-0 group-hover:border-[#52514A] transition-colors">
                    <Flaticon name={feature.iconName} className="text-xs" />
                  </div>
                  <h3 className="text-base font-semibold text-[#FAF9F5] tracking-tight group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-[#B7B5A9] leading-relaxed pl-10">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
