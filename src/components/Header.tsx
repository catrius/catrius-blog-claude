import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import type { Swiper as SwiperType } from 'swiper'
import { useGetPagesQuery } from '../store/api'
import { useAuth } from '../lib/AuthContext'
import Sidebar from './Sidebar'

const linkBase = 'text-sm no-underline transition-colors'
const linkActive = 'font-medium text-gray-900 dark:text-white'
const linkInactive = 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'

const fadeBase =
  'pointer-events-none absolute top-0 z-10 h-full w-6 transition-opacity duration-200'

export default function Header() {
  const { data: pages = [] } = useGetPagesQuery()
  const { user, isAdmin, isLoading: authLoading, signInWithGoogle, signOut } = useAuth()
  const location = useLocation()
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleProgress(swiper: SwiperType) {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  return (
    <>
      <header className="
        border-b border-gray-200
        dark:border-gray-800
      ">
        <div className="mx-auto flex max-w-7xl items-center gap-6 p-4">
          <Link to="/" className="
            shrink-0 text-xl font-bold tracking-tight text-gray-900 no-underline
            dark:text-white
          ">
            Catrius Blog
          </Link>
          <nav className="
            relative ml-auto hidden min-w-0
            md:block
          ">
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
              spaceBetween={16}
              className="overflow-hidden!"
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
                  <SwiperSlide key={page.id} className="w-auto!">
                    <Link
                      to={path}
                      className={`
                        ${linkBase}
                        ${isActive ? linkActive : linkInactive}
                      `}
                    >
                      {page.title}
                    </Link>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </nav>

          {/* Auth controls — desktop only */}
          {!authLoading && (
            <div className="
              hidden items-center gap-3 border-l border-gray-200 pl-6
              md:flex
              dark:border-gray-800
            ">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`
                        ${linkBase}
                        ${location.pathname.startsWith('/admin') ? linkActive : linkInactive}
                      `}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className={`
                      ${linkBase}
                      ${linkInactive}
                      cursor-pointer
                    `}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className={`
                    ${linkBase}
                    ${linkInactive}
                    cursor-pointer
                  `}
                >
                  Sign in
                </button>
              )}
            </div>
          )}

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="
              ml-auto rounded-md p-2 text-gray-600
              hover:bg-gray-100 hover:text-gray-900
              md:hidden
              dark:text-gray-400
              dark:hover:bg-gray-800 dark:hover:text-white
            "
          >
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
