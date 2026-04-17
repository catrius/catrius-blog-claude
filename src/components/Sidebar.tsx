import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import {
  useGetPagesQuery,
  useGetCategoriesQuery,
  useGetPostCountsQuery,
} from '@/store/api'
import { useAuth } from '@/lib/AuthContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { data: pages = [] } = useGetPagesQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: postCounts } = useGetPostCountsQuery()
  const { user, isAdmin, isLoading: authLoading, signInWithGoogle, signOut } = useAuth()
  const location = useLocation()

  const categorySlug = location.pathname.startsWith('/categories/')
    ? location.pathname.split('/')[2]
    : null

  const postCountsByCategory = new Map<number, number>()
  if (postCounts) {
    for (const [catId, count] of Object.entries(postCounts.countsByCategory)) {
      postCountsByCategory.set(Number(catId), count)
    }
  }

  // Close sidebar on route change
  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  // Prevent body scroll when open, compensate for scrollbar width
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 transition-opacity duration-300
          md:hidden
          ${open ? `opacity-100` : `pointer-events-none opacity-0`}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-white
          transition-transform duration-300
          md:hidden
          dark:bg-gray-950
          ${open ? `translate-x-0` : `translate-x-full`}
        `}
      >
        {/* Close button */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="
              rounded-md p-2 text-gray-500
              hover:bg-gray-100 hover:text-gray-900
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Pages */}
          {pages.length > 0 && (
            <div className="mb-8">
              <h3 className="
                mb-3 text-xs font-semibold tracking-wider text-gray-400
                uppercase
                dark:text-gray-500
              ">
                Pages
              </h3>
              <ul className="space-y-1">
                {pages.map((page) => {
                  const path = `/pages/${page.slug}`
                  const isActive = location.pathname === path
                  return (
                    <li key={page.id}>
                      <Link
                        to={path}
                        className={`
                          block rounded-md px-3 py-2 text-sm no-underline
                          transition-colors
                          ${isActive ? `
                            bg-gray-100 font-medium text-gray-900
                            dark:bg-gray-800 dark:text-white
                          ` : `
                            text-gray-700
                            hover:bg-gray-50
                            dark:text-gray-300
                            dark:hover:bg-gray-800/50
                          `}
                        `}
                      >
                        {page.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="
              mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase
              dark:text-gray-500
            ">
              Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/"
                  className={`
                    flex items-center justify-between rounded-md px-3 py-2
                    text-sm no-underline transition-colors
                    ${categorySlug === null && location.pathname === '/' ? `
                      bg-blue-50 font-medium text-blue-700
                      dark:bg-blue-900/30 dark:text-blue-300
                    ` : `
                      text-gray-700
                      hover:bg-gray-50
                      dark:text-gray-300
                      dark:hover:bg-gray-800/50
                    `}
                  `}
                >
                  All Posts
                  <span className="
                    text-gray-400
                    dark:text-gray-500
                  ">
                    {postCounts?.total ?? 0}
                  </span>
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/categories/${category.slug}`}
                    className={`
                      flex items-center justify-between rounded-md px-3 py-2
                      text-sm no-underline transition-colors
                      ${categorySlug === category.slug ? `
                        bg-blue-50 font-medium text-blue-700
                        dark:bg-blue-900/30 dark:text-blue-300
                      ` : `
                        text-gray-700
                        hover:bg-gray-50
                        dark:text-gray-300
                        dark:hover:bg-gray-800/50
                      `}
                    `}
                  >
                    {category.name}
                    <span className="
                      text-gray-400
                      dark:text-gray-500
                    ">
                      {postCountsByCategory.get(category.id) ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Auth controls */}
          {!authLoading && (
            <div className="
              mt-8 border-t border-gray-200 pt-6
              dark:border-gray-800
            ">
              {user ? (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`
                        block rounded-md px-3 py-2 text-sm no-underline
                        transition-colors
                        ${location.pathname.startsWith('/admin') ? `
                          bg-gray-100 font-medium text-gray-900
                          dark:bg-gray-800 dark:text-white
                        ` : `
                          text-gray-700
                          hover:bg-gray-50
                          dark:text-gray-300
                          dark:hover:bg-gray-800/50
                        `}
                      `}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="
                      block w-full rounded-md px-3 py-2 text-left text-sm
                      text-gray-700 transition-colors
                      hover:bg-gray-50
                      dark:text-gray-300
                      dark:hover:bg-gray-800/50
                    "
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="
                    block w-full rounded-md px-3 py-2 text-left text-sm
                    text-gray-700 transition-colors
                    hover:bg-gray-50
                    dark:text-gray-300
                    dark:hover:bg-gray-800/50
                  "
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </>
  )
}
