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

const pillBase = 'inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm no-underline transition-colors';
const pillActive = 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
const pillInactive = 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';

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
          dark:from-gray-950
          ${isBeginning ? `opacity-0` : `opacity-100`}
        `}
      />
      <div
        className={`
          ${fadeBase}
          right-0 bg-linear-to-l from-white
          dark:from-gray-950
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
              ${selectedCategorySlug === null ? pillActive : pillInactive}
            `}
          >
            All Posts
            <span
              className="
              ml-1.5 text-gray-400
              dark:text-gray-500
            "
            >
              ({totalPostCount})
            </span>
          </Link>
        </SwiperSlide>
        {categories.map((category) => (
          <SwiperSlide key={category.id} className="w-auto!">
            <Link
              to={`/categories/${category.slug}`}
              className={`
                ${pillBase}
                ${selectedCategorySlug === category.slug ? pillActive : pillInactive}
              `}
            >
              {category.name}
              <span
                className="
                ml-1.5 text-gray-400
                dark:text-gray-500
              "
              >
                ({postCountsByCategory.get(category.id) ?? 0})
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </nav>
  );
}
