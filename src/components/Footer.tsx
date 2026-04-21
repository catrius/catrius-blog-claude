import { Link } from 'react-router';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/tags', label: 'Tags' },
];

export default function Footer() {
  return (
    <footer
      className="
        border-t-2 border-transparent
        bg-[linear-gradient(to_right,#3b82f6,#8b5cf6,#ec4899)]
        bg-size-[100%_2px] bg-top bg-no-repeat
      "
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="flex items-center justify-center gap-6">
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
