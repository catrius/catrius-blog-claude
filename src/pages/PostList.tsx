import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Tables } from '../types/database'

type Post = Tables<'post'>

interface PostListProps {
  posts: Post[]
  title: string
  hasMore: boolean
  isFetching: boolean
  onLoadMore: () => void
}

export default function PostList({
  posts,
  title,
  hasMore,
  isFetching,
  onLoadMore,
}: PostListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isFetching, onLoadMore])

  return (
    <main className="min-w-0 flex-1">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {posts.length === 0 && !isFetching ? (
        <p>No posts yet.</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-lg border border-gray-200 p-6 hover:border-blue-500 transition-colors dark:border-gray-700"
              >
                <Link
                  to={`/posts/${post.slug}`}
                  className="block no-underline text-inherit"
                >
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-500 mb-3 dark:text-gray-400">
                    {post.excerpt}
                  </p>
                  <time className="text-sm text-gray-400 dark:text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
          <div ref={sentinelRef} className="h-1" />
          {isFetching && (
            <p className="text-center py-4 text-gray-500">
              Loading more posts...
            </p>
          )}
        </>
      )}
    </main>
  )
}
