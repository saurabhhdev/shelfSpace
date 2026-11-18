import React from 'react';
import { Flaticon } from '../ui/Flaticon';

export const OssiumFeatures: React.FC = () => {
  // 1. What You Can Do — Three Core Benefit Blocks
  const benefits = [
    {
      number: '01',
      title: 'Keep Everything Together',
      description:
        'Bring your developer tools, repositories, UI components, code snippets and useful references into one organized place instead of searching across multiple websites and saved lists.',
      iconName: 'apps',
    },
    {
      number: '02',
      title: 'Organize Around Your Projects',
      description:
        'Group relevant resources by project, so the tools, references and inspiration you need are always easy to find when working on something.',
      iconName: 'folder',
    },
    {
      number: '03',
      title: 'Find What You Need Faster',
      description:
        "Use categories, tags, favorites and search to quickly find the resources you've saved without going through everything again.",
      iconName: 'search',
    },
  ];

  // 2. Small Features Section — Six Compact Items
  const features = [
    {
      title: 'Resource Collection',
      description:
        'Save tools, repositories, components, snippets and useful references in one place.',
      iconName: 'boxes',
    },
    {
      title: 'Project Organization',
      description:
        'Create projects and keep their relevant resources grouped together.',
      iconName: 'folder-open',
    },
    {
      title: 'Smart Auto Add',
      description:
        'Fetch resource details automatically from a URL and review them before saving.',
      iconName: 'sparkles',
    },
    {
      title: 'Auto Categorization & Tags',
      description:
        'Get relevant category and tag suggestions to keep your collection organized.',
      iconName: 'tags',
    },
    {
      title: 'Quick Search & Filters',
      description:
        'Find saved resources using search, categories, resource types and tags.',
      iconName: 'settings-sliders',
    },
    {
      title: 'Favorites',
      description:
        'Keep your most useful resources within easy reach.',
      iconName: 'star',
    },
  ];

  return (
    <div id="features" className="relative bg-transparent">
      {/* =========================================================================
          SECTION 1: WHAT YOU CAN DO
          Explains practical benefits communicating why Shelfspace is useful
         ========================================================================= */}
      <section className="py-20 sm:py-28 border-t border-[#3E3E38] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              What You Can Do
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#B7B5A9] leading-relaxed">
              Keep the things you find useful close to the things you build.
            </p>
          </div>

          {/* 3 Clean Content Blocks in Established Rectangular Grid Frame */}
          <div className="relative border border-[#3E3E38]">
            {/* Subtle corner crosshair accents */}
            <span className="absolute -top-2 -left-2 text-neutral-600 font-mono text-xs select-none">+</span>
            <span className="absolute -top-2 -right-2 text-neutral-600 font-mono text-xs select-none">+</span>
            <span className="absolute -bottom-2 -left-2 text-neutral-600 font-mono text-xs select-none">+</span>
            <span className="absolute -bottom-2 -right-2 text-neutral-600 font-mono text-xs select-none">+</span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#3E3E38]">
              {benefits.map((item) => {
                return (
                  <div
                    key={item.number}
                    className="bg-[#1C1C1B] p-7 sm:p-9 flex flex-col justify-between hover:bg-[#1A1915] transition-colors group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-mono text-xs text-[#D97757] tracking-wider font-medium">
                          {item.number}
                        </span>
                        <div className="w-7 h-7 rounded bg-[#1B1B19] border border-[#3E3E38] flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                          <Flaticon name={item.iconName} className="text-xs" />
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-[#FAF9F5] tracking-tight">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SMALL FEATURES SECTION
          Placed immediately below, compact and explaining what the app offers
         ========================================================================= */}
      <section className="py-20 sm:py-28 border-t border-[#3E3E38] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              Built to Keep You Organized
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#B7B5A9] leading-relaxed">
              Everything you need to manage your developer resources, without the unnecessary complexity.
            </p>
          </div>

          {/* 6 Compact Feature Items in Clean Grid */}
          <div className="relative border border-[#3E3E38]">
            {/* Subtle corner crosshair accents */}
            <span className="absolute -top-2 -left-2 text-neutral-600 font-mono text-xs select-none">+</span>
            <span className="absolute -top-2 -right-2 text-neutral-600 font-mono text-xs select-none">+</span>
            <span className="absolute -bottom-2 -left-2 text-neutral-600 font-mono text-xs select-none">+</span>
            <span className="absolute -bottom-2 -right-2 text-neutral-600 font-mono text-xs select-none">+</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#3E3E38]">
              {features.map((feature) => {
                return (
                  <div
                    key={feature.title}
                    className="bg-[#1C1C1B] p-6 sm:p-7 flex flex-col justify-start hover:bg-[#1A1915] transition-colors group"
                  >
                    <div className="w-7 h-7 rounded bg-[#1B1B19] border border-[#3E3E38] flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors mb-4">
                      <Flaticon name={feature.iconName} className="text-xs" />
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-[#FAF9F5] tracking-tight">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
