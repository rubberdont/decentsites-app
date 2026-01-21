'use client';

import type { SocialStat, SectionConfig } from '@/types';

// Default stats (current hardcoded content)
const defaultStats: SocialStat[] = [
  { id: '1', value: '15.2K', label: 'Followers', platform: 'instagram' },
  { id: '2', value: '4.9/5', label: '350+ Reviews', platform: 'facebook' },
  { id: '3', value: '25K+', label: 'Community Likes', platform: 'tiktok' }
];

const defaultSectionConfig: SectionConfig = {
  title: 'Trusted by the Community',
  subtitle: 'Our reputation speaks for itself across all platforms.'
};

// Platform icons
const platformIcons: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.415 2.175 8.796 2.163 12 2.163m0-2.163C8.74 0 8.333.012 7.053.072 2.695.272.273 2.69.073 7.052.012 8.333 0 8.74 0 12s.012 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.988 8.74 24 12 24s3.667-.012 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98C23.988 15.667 24 15.26 24 12s-.012-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667.012 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
    </svg>
  ),
  facebook: (
    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  tiktok: (
    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.16.99.13 2.02.77 2.82.63.8 1.57 1.35 2.55 1.48.98.13 2.04-.13 2.84-.74.8-.59 1.27-1.55 1.37-2.55.03-1.61.01-3.23.01-4.84V.02z" />
    </svg>
  ),
  custom: (
    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  )
};

interface StatsBarProps {
  sectionConfig?: SectionConfig;
  stats?: SocialStat[];
}

export default function StatsBar({ sectionConfig, stats }: StatsBarProps) {
  const section = sectionConfig || defaultSectionConfig;
  const statsData = stats && stats.length > 0 ? stats : defaultStats;

  return (
    <section className="bg-[#f5f5f5] dark:bg-[#1a1a1a] py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] dark:text-[#f5f5f5] sm:text-4xl font-display">
            {section.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-body">
            {section.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="group relative flex flex-col items-center justify-center rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a] p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#d4af37]/20 min-w-[250px]"
            >
              <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg text-[#1a1a1a] dark:text-[#f5f5f5] transition-transform duration-300 group-hover:scale-110">
                {platformIcons[stat.platform] || platformIcons.custom}
              </div>
              <p className="font-display text-5xl font-black text-[#d4af37]">{stat.value}</p>
              {stat.label === 'stars' ? (
                <div className="mt-2 flex items-center text-[#d4af37]">
                  {[1, 2, 3].map((i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <defs>
                      <linearGradient id="half">
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#half)" stroke="currentColor" strokeWidth="0.5" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              ) : (
                <p className="mt-2 font-body text-gray-500 dark:text-gray-400">{stat.label}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
