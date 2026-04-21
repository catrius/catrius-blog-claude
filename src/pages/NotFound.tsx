import { Link } from 'react-router';
import { SITE_NAME } from '@/constants';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <title>{`Page Not Found | ${SITE_NAME}`}</title>
      <p
        className="
          mb-2 font-heading text-7xl font-bold text-gray-200
          dark:text-slate-700
        "
      >
        404
      </p>
      <h1
        className="
          mb-3 font-heading text-2xl font-bold text-gray-900
          dark:text-slate-100
        "
      >
        Page not found
      </h1>
      <p
        className="
          mb-8 text-gray-500
          dark:text-slate-400
        "
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="
            rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white
            no-underline transition-colors
            hover:bg-blue-600
          "
        >
          Go home
        </Link>
        <Link
          to="/search"
          className="
            rounded-full border border-gray-200 px-5 py-2 text-sm font-medium
            text-gray-700 no-underline transition-colors
            hover:border-gray-300 hover:bg-gray-50
            dark:border-slate-700 dark:text-slate-300
            dark:hover:border-slate-600 dark:hover:bg-slate-800
          "
        >
          Search posts
        </Link>
      </div>
    </div>
  );
}
