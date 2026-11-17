import React from 'react';
import { 
  Terminal, 
  Boxes, 
  FolderGit2, 
  Globe, 
  SlidersHorizontal, 
  Search 
} from 'lucide-react';

export const OssiumFeatures: React.FC = () => {
  const capabilities = [
    {
      number: '01',
      title: 'Keep Your Developer Tools Close',
      description:
        'Maintain your personal collection of developer tools, libraries, frameworks, platforms and services. Keep the resources you frequently use or want to explore accessible in one place.',
      icon: Terminal,
    },
    {
      number: '02',
      title: 'Build Your Own Resource Library',
      description:
        'Collect useful UI components, reusable code snippets, design systems, templates, starter kits and assets that can help you with current and future projects.',
      icon: Boxes,
    },
    {
      number: '03',
      title: 'Manage Repositories and Projects',
      description:
        'Keep track of useful GitHub repositories, open-source projects, project references and implementations worth exploring or revisiting.',
      icon: FolderGit2,
    },
    {
      number: '04',
      title: 'Save Useful Links and References',
      description:
        'Save important websites, documentation, tutorials, articles, videos and other online references. Keep useful discoveries organized instead of losing them among browser bookmarks, scattered notes and multiple platforms.',
      icon: Globe,
    },
    {
      number: '05',
      title: 'Organize Everything Your Way',
      description:
        'Maintain a structured personal collection of resources using the organizational capabilities already implemented in Shelfspace. Make your library easier to browse, manage and revisit.',
      icon: SlidersHorizontal,
    },
    {
      number: '06',
      title: 'Rediscover Resources When Needed',
      description:
        'Find previously collected tools, repositories, components and references whenever a new project or development challenge calls for them.',
      icon: Search,
    },
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-transparent border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Introduction */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#E5E5E5] leading-tight">
            What You Can Do With Shelfspace
          </h2>

          <p className="mt-4 text-lg sm:text-xl font-medium text-[#E5E5E5]/90">
            Everything you need for your next build, in one place.
          </p>

          <p className="mt-3 text-sm sm:text-base text-[#8E8E93] leading-relaxed">
            Shelfspace is your personal workspace for collecting, organizing and managing the tools, repositories, components and resources you find useful throughout your development journey.
          </p>
        </div>

        {/* 6 Core Capabilities Editorial Grid */}
        <div className="relative border border-white/[0.08] bg-[#121316]/50">
          {/* Subtle corner crosshair accents */}
          <span className="absolute -top-2 -left-2 text-neutral-600 font-mono text-xs select-none">+</span>
          <span className="absolute -top-2 -right-2 text-neutral-600 font-mono text-xs select-none">+</span>
          <span className="absolute -bottom-2 -left-2 text-neutral-600 font-mono text-xs select-none">+</span>
          <span className="absolute -bottom-2 -right-2 text-neutral-600 font-mono text-xs select-none">+</span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x lg:divide-x divide-white/[0.08]">
            {capabilities.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.number}
                  className="p-8 sm:p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs text-[#09AE5B] tracking-wider">
                        {item.number}
                      </span>
                      <Icon className="w-5 h-5 text-neutral-400 stroke-[1.5]" />
                    </div>

                    <h3 className="text-lg font-semibold text-[#E5E5E5] tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm text-[#8E8E93] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x lg:divide-x divide-white/[0.08]">
            {capabilities.slice(3, 6).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.number}
                  className="p-8 sm:p-10 flex flex-col justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs text-[#09AE5B] tracking-wider">
                        {item.number}
                      </span>
                      <Icon className="w-5 h-5 text-neutral-400 stroke-[1.5]" />
                    </div>

                    <h3 className="text-lg font-semibold text-[#E5E5E5] tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm text-[#8E8E93] leading-relaxed">
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
  );
};
