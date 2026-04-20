import { useState } from 'react';
import { Link } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import type { Swiper as SwiperType } from 'swiper';
import type { Tables } from '@/types/database';

type Category = Tables<'category'>;

interface NavBarProps {
  categories: Category[];
  postCountsByCategory: Map<number, number>;
  totalPostCount: number;
  selectedCategorySlug: string | null;
}

const categoryColors = [
  { active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
  { active: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
  { active: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20' },
  { active: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20' },
  { active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
  { active: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300', hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20' },
  { active: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/20' },
  { active: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20' },
];

const pillBase = 'inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm no-underline transition-colors';
const pillInactive = 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800';

const fadeBase = 'pointer-events-none absolute top-0 z-10 h-full w-8 transition-opacity duration-200';

export default function NavBar({
  categories,
  postCountsByCategory,
  totalPostCount,
  selectedCategorySlug,
}: NavBarProps) {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  function handleProgress(swiper: SwiperType) {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }

  return (
    <nav
      className="
        relative mb-6 hidden
        md:block
      "
    >
      <div
        className={`
          ${fadeBase}
          left-0 bg-linear-to-r from-white
          dark:from-slate-900
          ${isBeginning ? `opacity-0` : `opacity-100`}
        `}
      />
      <div
        className={`
          ${fadeBase}
          right-0 bg-linear-to-l from-white
          dark:from-slate-900
          ${isEnd ? `opacity-0` : `opacity-100`}
        `}
      />
      <Swiper
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={8}
        className="overflow-hidden!"
        onSlideChange={handleProgress}
        onReachBeginning={handleProgress}
        onReachEnd={handleProgress}
        onAfterInit={handleProgress}
        onSliderMove={handleProgress}
      >
        <SwiperSlide className="w-auto!">
          <Link
            to="/"

            className={`
              ${pillBase}
              ${selectedCategorySlug === null ? `
                bg-gray-900 font-medium text-white
                dark:bg-white dark:text-slate-900
              ` : pillInactive}
            `}
          >
            All Posts
            <span
              className={`
                ml-1.5
                ${selectedCategorySlug === null ? `
                  text-gray-300
                  dark:text-slate-600
                ` : `
                  text-gray-400
                  dark:text-slate-500
                `}
              `}
            >
              ({totalPostCount})
            </span>
          </Link>
        </SwiperSlide>
        {categories.map((category, index) => {
          const color = categoryColors[index % categoryColors.length];
          const isActive = selectedCategorySlug === category.slug;
          return (
            <SwiperSlide key={category.id} className="w-auto!">
              <Link
                to={`/categories/${category.slug}`}
    
                className={`
                  ${pillBase}
                  font-medium
                  ${isActive ? color.active : `
                    text-gray-700
                    dark:text-slate-300
                    ${color.hover}
                  `}
                `}
              >
                {category.name}
                <span
                  className={`
                    ml-1.5
                    ${isActive ? 'opacity-70' : `
                      text-gray-400
                      dark:text-slate-500
                    `}
                  `}
                >
                  ({postCountsByCategory.get(category.id) ?? 0})
                </span>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </nav>
  );
}
