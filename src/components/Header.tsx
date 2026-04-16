import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import type { Swiper as SwiperType } from 'swiper'
import { useGetPagesQuery } from '../store/api'

const linkBase = 'text-sm no-underline transition-colors'
const linkActive = 'font-medium text-gray-900 dark:text-white'
const linkInactive = 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'

const fadeBase =
  'pointer-events-none absolute top-0 z-10 h-full w-6 transition-opacity duration-200'

export default function Header() {
  const { data: pages = [] } = useGetPagesQuery()
  const location = useLocation()
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)

  function handleProgress(swiper: SwiperType) {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
        <Link to="/" className="shrink-0 text-xl font-bold tracking-tight text-gray-900 no-underline dark:text-white">
          Catrius Blog
        </Link>
        <nav className="relative ml-auto min-w-0">
          <div
            className={`${fadeBase} left-0 bg-gradient-to-r from-white dark:from-gray-950 ${isBeginning ? 'opacity-0' : 'opacity-100'}`}
          />
          <div
            className={`${fadeBase} right-0 bg-gradient-to-l from-white dark:from-gray-950 ${isEnd ? 'opacity-0' : 'opacity-100'}`}
          />
          <Swiper
            modules={[FreeMode]}
            freeMode
            slidesPerView="auto"
            spaceBetween={16}
            className="!overflow-hidden"
            onSlideChange={handleProgress}
            onReachBeginning={handleProgress}
            onReachEnd={handleProgress}
            onAfterInit={handleProgress}
            onSliderMove={handleProgress}
          >
            {pages.map((page) => {
              const path = `/pages/${page.slug}`
              const isActive = location.pathname === path
              return (
                <SwiperSlide key={page.id} className="!w-auto">
                  <Link
                    to={path}
                    className={`${linkBase} ${isActive ? linkActive : linkInactive}`}
                  >
                    {page.title}
                  </Link>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </nav>
      </div>
    </header>
  )
}
