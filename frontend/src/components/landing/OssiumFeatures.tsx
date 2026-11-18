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
          Explains practical benefits communicating why Shelfspace is useful
         ========================================================================= */}
      <section id="what-you-can-do" className="py-20 sm:py-24 border-t border-[#3E3E38] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Symmetrical & Centered */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              What You Can Do
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] leading-relaxed">
              Keep the things you find useful close to the things you build.
            </p>
          </div>

          {/* 3 Symmetrical Content Blocks with Uniform Height & Spacing */}
          <div className="rounded-lg border border-[#3E3E38] bg-[#1C1C1B] overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#3E3E38]">
              {benefits.map((item) => (
                <div
                  key={item.number}
                  className="p-7 sm:p-8 lg:p-9 flex flex-col justify-between hover:bg-[#1A1915] transition-colors duration-150 group h-full"
                >
                  <div>
                    {/* Top Alignment: Number Badge & Restrained Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs font-semibold text-[#D97757] tracking-wider bg-[#D97757]/10 px-2 py-0.5 rounded border border-[#D97757]/20">
                        {item.number}
                      </span>
                      <div className="w-8 h-8 rounded-md bg-[#262624] border border-[#3E3E38] flex items-center justify-center text-[#B7B5A9] group-hover:text-[#FAF9F5] group-hover:border-[#52514A] transition-colors">
                        <Flaticon name={item.iconName} className="text-xs" />
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-base sm:text-lg font-semibold text-[#FAF9F5] tracking-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURES SECTION
          6-Item 3x2 Symmetrical Grid
         ========================================================================= */}
      <section id="features" className="py-20 sm:py-24 border-t border-[#3E3E38] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Symmetrical & Centered */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              Built to Keep You Organized
            </h2>
            <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] leading-relaxed">
              Everything you need to manage your developer resources, without the unnecessary complexity.
            </p>
          </div>

          {/* 6 Features - 3 Columns x 2 Rows Symmetrical Grid with Crisp Dividers */}
          <div className="rounded-lg border border-[#3E3E38] bg-[#3E3E38] overflow-hidden gap-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 shadow-sm">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#1C1C1B] p-6 sm:p-7 flex flex-col justify-start hover:bg-[#1A1915] transition-colors duration-150 group h-full"
              >
                {/* Standardized Minimal Icon Container */}
                <div className="w-8 h-8 rounded-md bg-[#262624] border border-[#3E3E38] flex items-center justify-center text-[#D97757] group-hover:border-[#52514A] transition-colors mb-4">
                  <Flaticon name={feature.iconName} className="text-xs" />
                </div>

                {/* Feature Title */}
                <h3 className="text-sm sm:text-base font-semibold text-[#FAF9F5] tracking-tight group-hover:text-white transition-colors">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="mt-2 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed">
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
