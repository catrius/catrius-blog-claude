import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserLikedPostsQuery } from '@/store/api';
import { SITE_NAME } from '@/constants';

export default function LikedPosts() {
  const { user, signInWithGoogle } = useAuth();
  const { data: posts = [], isLoading } = useGetUserLikedPostsQuery(user?.id ?? '', { skip: !user });

  if (!user) {
    return (
      <div className="py-12 text-center">
        <title>{`Liked Posts | ${SITE_NAME}`}</title>
        <svg
          className="
            mx-auto mb-4 size-12 text-gray-300
            dark:text-slate-600
          "
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
        <p
          className="
            mb-4 text-gray-500
            dark:text-slate-400
          "
        >
          Sign in to see posts you&apos;ve liked.
        </p>
        <button
          onClick={signInWithGoogle}
          className="
            cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium
            text-white transition-colors
            hover:bg-gray-800
            dark:bg-white dark:text-slate-900
            dark:hover:bg-slate-200
          "
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div data-skeleton className="mb-6 h-8 w-40" />
        <div
          className="
            grid gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="
                rounded-lg p-4 shadow-md
                dark:bg-slate-800/50
              "
            >
              <div data-skeleton className="mb-2 h-5 w-3/4" />
              <div data-skeleton className="mb-2 h-4 w-full" />
              <div data-skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <title>{`Liked Posts | ${SITE_NAME}`}</title>
      <h1 className="
        mb-6 flex items-center gap-3 font-heading text-2xl font-bold
      ">
        <span className="
          inline-block h-6 w-1 rounded-full bg-linear-to-b from-blue-500
          via-purple-500 to-pink-500
        " />
        Liked Posts
      </h1>
      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <svg
            className="
              mx-auto mb-4 size-16 text-gray-300
              dark:text-slate-600
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
          <p className="
            mb-2 text-lg font-medium text-gray-500
            dark:text-slate-400
          ">No liked posts yet</p>
          <p className="
            mb-6 text-sm text-gray-400
            dark:text-slate-500
          ">Browse posts and tap the heart to save them here.</p>
          <Link
            to="/"
            className="
              rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white
              no-underline transition-colors
              hover:bg-blue-600
            "
          >
            Browse posts
          </Link>
        </div>
      ) : (
        <div
          className="
            grid gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.slug}`}
              className="
                block rounded-lg p-4 no-underline shadow-md transition-all
                duration-200
                hover:-translate-y-0.5 hover:shadow-xl
                dark:bg-slate-800/50 dark:shadow-slate-900/50
                dark:hover:shadow-blue-500/10
              "
            >
              <h2
                className="
                  mb-1 font-heading text-base font-semibold text-gray-900
                  dark:text-slate-100
                "
              >
                {post.title}
              </h2>
              <p
                className="
                  line-clamp-2 text-sm text-gray-500
                  dark:text-slate-400
                "
              >
                {post.excerpt}
              </p>
              <time
                className="
                  mt-2 block text-xs text-gray-400
                  dark:text-slate-500
                "
              >
                {new Date(post.created_at).toLocaleDateString()}
              </time>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
