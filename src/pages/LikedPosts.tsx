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
            dark:text-gray-600
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
          dark:text-gray-400
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
            dark:bg-white dark:text-gray-900
            dark:hover:bg-gray-200
          "
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (isLoading) return null;

  return (
    <div>
      <title>{`Liked Posts | ${SITE_NAME}`}</title>
      <h1 className="mb-6 text-2xl font-bold">Liked Posts</h1>
      {posts.length === 0 ? (
        <p
          className="
          text-gray-500
          dark:text-gray-400
        "
        >
          You haven&apos;t liked any posts yet. Browse posts and tap the heart to save them here.
        </p>
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
                block rounded-lg border border-gray-200 p-4 no-underline
                transition-colors
                hover:border-blue-300 hover:bg-blue-50/50
                dark:border-gray-700
                dark:hover:border-blue-700 dark:hover:bg-blue-900/20
              "
            >
              <h2
                className="
                mb-1 text-base font-semibold text-gray-900
                dark:text-gray-100
              "
              >
                {post.title}
              </h2>
              <p
                className="
                line-clamp-2 text-sm text-gray-500
                dark:text-gray-400
              "
              >
                {post.excerpt}
              </p>
              <time
                className="
                mt-2 block text-xs text-gray-400
                dark:text-gray-500
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
