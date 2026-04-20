import { Link } from 'react-router';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/tags', label: 'Tags' },
];

export default function Footer() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer
      className="
        border-t-2 border-transparent
        bg-[linear-gradient(to_right,#3b82f6,#8b5cf6,#ec4899)]
        bg-size-[100%_2px] bg-top bg-no-repeat
      "
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div
          className="
            flex flex-col items-center justify-between gap-6
            sm:flex-row
          "
        >
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="
                  text-sm text-gray-600 no-underline transition-colors
                  hover:text-gray-900
                  dark:text-slate-400
                  dark:hover:text-white
                "
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="
              group flex cursor-pointer items-center gap-1.5 text-sm
              text-gray-500 transition-colors
              hover:text-gray-900
              dark:text-slate-400
              dark:hover:text-white
            "
          >
            Back to top
            <svg
              className="
                size-4 transition-transform
                group-hover:-translate-y-0.5
              "
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>

        <div
          className="
            mt-6 border-t border-gray-200 pt-6 text-center
            dark:border-slate-800
          "
        >
          <p
            className="
              text-sm text-gray-400
              dark:text-slate-500
            "
          >
            &copy; {new Date().getFullYear()} Catrius Blog
          </p>
        </div>
      </div>
    </footer>
  );
}
