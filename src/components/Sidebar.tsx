import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useGetPagesQuery, useGetCategoriesQuery, useGetPostCountsQuery } from '@/store/api';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarLink({ to, isActive, children }: { to: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center justify-between rounded-md px-3 py-2 text-sm
        no-underline transition-colors
        ${
          isActive
            ? `
              bg-gray-100 font-medium text-gray-900
              dark:bg-gray-800 dark:text-white
            `
            : `
              text-gray-700
              hover:bg-gray-50
              dark:text-gray-300
              dark:hover:bg-gray-800/50
            `
        }
      `}
    >
      {children}
    </Link>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { data: pages = [] } = useGetPagesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: postCounts } = useGetPostCountsQuery();
  const { user, isAdmin, isLoading: authLoading, signInWithGoogle, signOut } = useAuth();
  const location = useLocation();

  const categorySlug = location.pathname.startsWith('/categories/') ? location.pathname.split('/')[2] : null;

  const postCountsByCategory = new Map<number, number>();
  if (postCounts) {
    for (const [catId, count] of Object.entries(postCounts.countsByCategory)) {
      postCountsByCategory.set(Number(catId), count);
    }
  }

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Prevent body scroll when open, compensate for scrollbar width
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

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
              cursor-pointer rounded-md p-2 text-gray-500
              hover:bg-gray-100 hover:text-gray-900
              dark:text-gray-400
              dark:hover:bg-gray-800 dark:hover:text-white
            "
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Search */}
          <div className="mb-8">
            <Link
              to="/search"
              className={`
                flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm
                no-underline transition-colors
                dark:bg-gray-800
                ${
                  location.pathname === '/search'
                    ? `
                      font-medium text-gray-900
                      dark:text-white
                    `
                    : `
                      text-gray-700
                      hover:bg-gray-50
                      dark:text-gray-300
                      dark:hover:bg-gray-800/50
                    `
                }
              `}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              Search
            </Link>
          </div>

          {/* Pages */}
          {pages.length > 0 && (
            <div className="mb-8">
              <h3
                className="
                  mb-3 text-xs font-semibold tracking-wider text-gray-400
                  uppercase
                  dark:text-gray-500
                "
              >
                Pages
              </h3>
              <ul className="space-y-1">
                {pages.map((page) => (
                  <li key={page.id}>
                    <SidebarLink to={`/pages/${page.slug}`} isActive={location.pathname === `/pages/${page.slug}`}>
                      {page.title}
                    </SidebarLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3
              className="
                mb-3 text-xs font-semibold tracking-wider text-gray-400
                uppercase
                dark:text-gray-500
              "
            >
              Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <SidebarLink to="/" isActive={categorySlug === null && location.pathname === '/'}>
                  All Posts
                  <span
                    className="
                      text-gray-400
                      dark:text-gray-500
                    "
                  >
                    {postCounts?.total ?? 0}
                  </span>
                </SidebarLink>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <SidebarLink to={`/categories/${category.slug}`} isActive={categorySlug === category.slug}>
                    {category.name}
                    <span
                      className="
                        text-gray-400
                        dark:text-gray-500
                      "
                    >
                      {postCountsByCategory.get(category.id) ?? 0}
                    </span>
                  </SidebarLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Liked posts — visible when signed in */}
          {user && (
            <div className="mt-8">
              <SidebarLink to="/likes" isActive={location.pathname === '/likes'}>
                <span className="flex items-center gap-2">
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill={location.pathname === '/likes' ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                  Liked Posts
                </span>
              </SidebarLink>
            </div>
          )}

          {/* Theme toggle */}
          <div
            className="
              mt-8 border-t border-gray-200 pt-6
              dark:border-gray-800
            "
          >
            <h3
              className="
                mb-3 text-xs font-semibold tracking-wider text-gray-400
                uppercase
                dark:text-gray-500
              "
            >
              Theme
            </h3>
            <ThemeToggle />
          </div>

          {/* Auth controls */}
          {!authLoading && (
            <div
              className="
                mt-8 border-t border-gray-200 pt-6
                dark:border-gray-800
              "
            >
              {user ? (
                <div className="space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`
                        block rounded-md px-3 py-2 text-sm no-underline
                        transition-colors
                        ${
                          location.pathname.startsWith('/admin')
                            ? `
                              bg-gray-100 font-medium text-gray-900
                              dark:bg-gray-800 dark:text-white
                            `
                            : `
                              text-gray-700
                              hover:bg-gray-50
                              dark:text-gray-300
                              dark:hover:bg-gray-800/50
                            `
                        }
                      `}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="
                      block w-full cursor-pointer rounded-md px-3 py-2 text-left
                      text-sm text-gray-700 transition-colors
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
                    block w-full cursor-pointer rounded-md px-3 py-2 text-left
                    text-sm text-gray-700 transition-colors
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
  );
}
