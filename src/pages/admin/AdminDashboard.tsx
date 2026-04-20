import { Link } from 'react-router';
import { useGetAdminPostsQuery, useGetAdminPagesQuery } from '@/store/api';

export default function AdminDashboard() {
  const { data: posts = [], isLoading: postsLoading } = useGetAdminPostsQuery();
  const { data: pages = [], isLoading: pagesLoading } = useGetAdminPagesQuery();

  if (postsLoading || pagesLoading) return null;

  return (
    <div className="mx-auto">
      <h1 className="mb-8 text-2xl font-bold">Admin Dashboard</h1>
      <div
        className="
          grid gap-6
          sm:grid-cols-2
        "
      >
        <Link
          to="/admin/posts"
          className="
            rounded-lg border border-gray-200 p-6 no-underline transition
            hover:border-blue-300 hover:bg-blue-50/50
            dark:border-slate-800
            dark:hover:border-blue-700 dark:hover:bg-blue-900/20
          "
        >
          <h2
            className="
              text-lg font-semibold text-gray-900
              dark:text-white
            "
          >
            Posts
          </h2>
          <p
            className="
              mt-1 text-3xl font-bold text-blue-600
              dark:text-blue-400
            "
          >
            {posts.length}
          </p>
          <p
            className="
              mt-2 text-sm text-gray-500
              dark:text-slate-400
            "
          >
            Manage blog posts
          </p>
        </Link>
        <Link
          to="/admin/pages"
          className="
            rounded-lg border border-gray-200 p-6 no-underline transition
            hover:border-blue-300 hover:bg-blue-50/50
            dark:border-slate-800
            dark:hover:border-blue-700 dark:hover:bg-blue-900/20
          "
        >
          <h2
            className="
              text-lg font-semibold text-gray-900
              dark:text-white
            "
          >
            Pages
          </h2>
          <p
            className="
              mt-1 text-3xl font-bold text-blue-600
              dark:text-blue-400
            "
          >
            {pages.length}
          </p>
          <p
            className="
              mt-2 text-sm text-gray-500
              dark:text-slate-400
            "
          >
            Manage static pages
          </p>
        </Link>
      </div>
    </div>
  );
}
