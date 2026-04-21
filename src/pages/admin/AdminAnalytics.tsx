import { useState } from 'react';
import { Link } from 'react-router';
import { useGetPostAnalyticsQuery } from '@/store/api';

type SortKey = 'view_count' | 'like_count' | 'comment_count' | 'title' | 'created_at';
type SortDir = 'asc' | 'desc';

export default function AdminAnalytics() {
  const { data, isLoading } = useGetPostAnalyticsQuery();
  const [sortKey, setSortKey] = useState<SortKey>('view_count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  if (isLoading || !data) return null;

  const { posts, totals } = data;

  const sorted = [...posts].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'title') return dir * a.title.localeCompare(b.title);
    if (sortKey === 'created_at') return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return dir * (a[sortKey] - b[sortKey]);
  });

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  }

  const topPosts = [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 10);
  const chartMax = Math.max(...topPosts.map((p) => p.view_count), 1);

  return (
    <div className="mx-auto">
      <h1 className="mb-8 text-2xl font-bold">Analytics</h1>

      <div
        className="
          mb-8 grid grid-cols-3 gap-3
          sm:gap-4
        "
      >
        <div
          className="
            rounded-lg border border-gray-200 p-3
            sm:p-5
            dark:border-slate-800
          "
        >
          <p
            className="
              text-xs font-medium text-gray-500
              sm:text-sm
              dark:text-slate-400
            "
          >
            Total Views
          </p>
          <p
            className="
              mt-1 text-xl font-bold text-blue-600
              sm:text-3xl
              dark:text-blue-400
            "
          >
            {totals.totalViews.toLocaleString()}
          </p>
        </div>
        <div
          className="
            rounded-lg border border-gray-200 p-3
            sm:p-5
            dark:border-slate-800
          "
        >
          <p
            className="
              text-xs font-medium text-gray-500
              sm:text-sm
              dark:text-slate-400
            "
          >
            Total Likes
          </p>
          <p
            className="
              mt-1 text-xl font-bold text-pink-600
              sm:text-3xl
              dark:text-pink-400
            "
          >
            {totals.totalLikes.toLocaleString()}
          </p>
        </div>
        <div
          className="
            rounded-lg border border-gray-200 p-3
            sm:p-5
            dark:border-slate-800
          "
        >
          <p
            className="
              text-xs font-medium text-gray-500
              sm:text-sm
              dark:text-slate-400
            "
          >
            Total Comments
          </p>
          <p
            className="
              mt-1 text-xl font-bold text-emerald-600
              sm:text-3xl
              dark:text-emerald-400
            "
          >
            {totals.totalComments.toLocaleString()}
          </p>
        </div>
      </div>

      {topPosts.length > 0 && (
        <div
          className="
            mb-8 rounded-lg border border-gray-200 p-5
            dark:border-slate-800
          "
        >
          <h2
            className="
              mb-4 text-lg font-semibold text-gray-900
              dark:text-white
            "
          >
            Top Posts by Views
          </h2>
          <div className="space-y-3">
            {topPosts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span
                  className="
                    w-5 shrink-0 text-right text-xs text-gray-400 tabular-nums
                    dark:text-slate-500
                  "
                >
                  {i + 1}
                </span>
                <Link
                  to={`/posts/${p.slug}`}
                  className="
                    line-clamp-2 w-28 shrink-0 text-sm/snug text-gray-700
                    no-underline
                    hover:text-blue-600
                    sm:w-48
                    dark:text-slate-300
                    dark:hover:text-blue-400
                  "
                  title={p.title}
                >
                  {p.title}
                </Link>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className="
                      h-5 overflow-hidden rounded-full bg-gray-100
                      dark:bg-slate-800
                    "
                    style={{ width: '100%' }}
                  >
                    <div
                      className="
                        flex h-full items-center rounded-full bg-blue-500
                        dark:bg-blue-400
                      "
                      style={{ width: `${(p.view_count / chartMax) * 100}%`, minWidth: p.view_count > 0 ? '2px' : 0 }}
                    />
                  </div>
                  <span
                    className="
                      w-10 shrink-0 text-right text-xs text-gray-500
                      tabular-nums
                      dark:text-slate-400
                    "
                  >
                    {p.view_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr
              className="
                border-b border-gray-200
                dark:border-slate-800
              "
            >
              <th
                className="
                  cursor-pointer pr-4 pb-3 font-medium text-gray-500 select-none
                  hover:text-gray-700
                  dark:text-slate-400
                  dark:hover:text-slate-200
                "
                onClick={() => handleSort('title')}
              >
                Title{sortIndicator('title')}
              </th>
              <th
                className="
                  cursor-pointer pr-4 pb-3 text-right font-medium text-gray-500
                  select-none
                  hover:text-gray-700
                  dark:text-slate-400
                  dark:hover:text-slate-200
                "
                onClick={() => handleSort('view_count')}
              >
                Views{sortIndicator('view_count')}
              </th>
              <th
                className="
                  cursor-pointer pr-4 pb-3 text-right font-medium text-gray-500
                  select-none
                  hover:text-gray-700
                  dark:text-slate-400
                  dark:hover:text-slate-200
                "
                onClick={() => handleSort('like_count')}
              >
                Likes{sortIndicator('like_count')}
              </th>
              <th
                className="
                  cursor-pointer pr-4 pb-3 text-right font-medium text-gray-500
                  select-none
                  hover:text-gray-700
                  dark:text-slate-400
                  dark:hover:text-slate-200
                "
                onClick={() => handleSort('comment_count')}
              >
                Comments{sortIndicator('comment_count')}
              </th>
              <th
                className="
                  cursor-pointer pb-3 text-right font-medium text-gray-500
                  select-none
                  hover:text-gray-700
                  dark:text-slate-400
                  dark:hover:text-slate-200
                "
                onClick={() => handleSort('created_at')}
              >
                Date{sortIndicator('created_at')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="
                    py-6 text-center text-gray-500
                    dark:text-slate-400
                  "
                >
                  No posts yet.
                </td>
              </tr>
            ) : (
              sorted.map((post) => (
                <tr
                  key={post.id}
                  className="
                    border-b border-gray-100
                    dark:border-slate-800/50
                  "
                >
                  <td className="py-3 pr-4">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="
                        text-gray-900 no-underline
                        hover:text-blue-600
                        dark:text-white
                        dark:hover:text-blue-400
                      "
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td
                    className="
                      py-3 pr-4 text-right text-gray-700 tabular-nums
                      dark:text-slate-300
                    "
                  >
                    {post.view_count.toLocaleString()}
                  </td>
                  <td
                    className="
                      py-3 pr-4 text-right text-gray-700 tabular-nums
                      dark:text-slate-300
                    "
                  >
                    {post.like_count.toLocaleString()}
                  </td>
                  <td
                    className="
                      py-3 pr-4 text-right text-gray-700 tabular-nums
                      dark:text-slate-300
                    "
                  >
                    {post.comment_count.toLocaleString()}
                  </td>
                  <td
                    className="
                      py-3 text-right text-gray-500
                      dark:text-slate-400
                    "
                  >
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
