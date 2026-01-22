'use client';

import { motion } from 'framer-motion';
import type { PortfolioItem, SectionConfig } from '@/types';

// Default items (current hardcoded content)
const defaultItems: PortfolioItem[] = [
  {
    id: '1',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyKH2-WfbBJ0sxbbd8PXPxPqlet1MD6UMlkD5riQniZ5PbpSM4VUbzYb_72whGn8c1odW6lgEomDW2lShkrUMFqqqVAzpPFyKtZsTVLC-YR5uFAxMIbTsQyldCQuwWAycAA7F1-2bww7gOICrAhe_f6_kwvBM02bOzsRQUmCUwWpUMbcPW8vG1OSRdPXOoMFgydeA1yirhcatWrK8H9wA350jDCkHSC0oj2FoyjhDCFS-nLLOSy-dm_42ZiAElRCFFPGTBPT-PD8A',
    title: 'Classic Fade',
    alt_text: 'Man with a classic fade haircut, side profile'
  },
  {
    id: '2',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnFLdT-RhjJ4pv7IzCsMc7G2-gj6zqDdy_8k73wJLi1Y9M0vzWVzSRiIxTDu4dhK79hZe_rphp7Qnn8ERcEch3_0XCuOZQ664tBIYG8O_ffQMCxgrOMB9ltoWnUJQR5h5NoyEtRUqJAlxodt5DSZo-6jPw5FtqcDl2-EluBbDa9aVL7LOOE1uC_TGp5N2Ch7yFANWSxQUOpUWtHmcX0b-mg0oQ-XOCbET3-35s6g6_PniCLcAWBzuY7AyGfW4cb7U-zwLKgGWgwU8',
    title: 'Sharp Beard Trim',
    alt_text: 'Close up of a man with a perfectly trimmed and shaped beard'
  },
  {
    id: '3',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArxsy3iIPmxU1ozWW05HwTQX5qQq8ROIlRFIExDATvzXA0AnQS-ww08EVfSSMI4ASXYJSFn95siguR2n1uPB414Cc9riBPoNPJWVelg7tvUaVjTFk3GO6z9AKXj8koBhdm62uf6SNpT2S-74JZ7pWqhTxcwbvp7r8Sp3-Jw1WQ_3JjnU7leR6swagVzaUL71Ms0MLhMd89B_7cqlMTBy9Ti5w9mAvGGqhrrpqW-jvJqbu0Ac1wf_Vm9F1PmedgxVGIaBaxN06Hnck',
    title: 'Modern Pompadour',
    alt_text: 'Man with a stylish modern pompadour hairstyle'
  },
  {
    id: '4',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyqTSkx117QlntUHbQZNUaSksmlqpNe8lJ9fnJZfP6FGd17Hp0Xoj7x0mcIynke6mnn_b5fzTFTDuNXtdo-FbtWChQyp-nfeEQQrYg_0fDSYcstyqhSptkgOX5RTJGFCX7WUD6ZRIbBYBuMFQKkIysTIOHhGi7LFRA2ERmgnwouIBKUbFEirgu0kPqGEZMfVDmtR4PZZd580LQL_KKekAgJhwzOE50si_h-YnhBPhHN3PG8m-YYyZR_X5Qu0vTtgTy0iyefMNEULI',
    title: "The Shop's Ambiance",
    alt_text: 'Interior of the stylish and modern barbershop'
  }
];

const defaultSectionConfig: SectionConfig = {
  title: 'Our Work',
  subtitle: 'A gallery of our finest cuts and satisfied clients.'
};

interface PortfolioGalleryProps {
  sectionConfig?: SectionConfig;
  items?: PortfolioItem[];
}

export default function PortfolioGallery({ sectionConfig, items }: PortfolioGalleryProps) {
  const section = sectionConfig || defaultSectionConfig;
  const galleryItems = items && items.length > 0 ? items : defaultItems;

  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-[#f5f5f5] dark:text-[#f5f5f5] sm:text-4xl font-display">
          {section.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400 dark:text-gray-400 font-body">
          {section.subtitle}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8
        }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {galleryItems.map((item, index) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: index * 0.1 
            }}
            className="group relative overflow-hidden rounded-lg aspect-[3/4]"
          >
            <div 
              className="bg-cover bg-center w-full h-full transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url("${item.image_url}")` }}
              aria-label={item.alt_text}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-lg font-bold font-display">
              {item.title}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
