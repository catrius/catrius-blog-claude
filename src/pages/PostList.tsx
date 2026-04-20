import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { Tables } from '@/types/database'
import LikeButton from '@/components/LikeButton'

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
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      {posts.length === 0 && !isFetching ? (
        <p>No posts yet.</p>
      ) : (
        <>
          <ul className="
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          ">
            {posts.map((post) => (
              <li
                key={post.id}
                className="
                  flex flex-col rounded-lg border border-gray-200 p-6
                  transition-colors
                  hover:border-blue-500
                  dark:border-gray-700
                "
              >
                <Link
                  to={`/posts/${post.slug}`}
                  className="block text-inherit no-underline"
                >
                  <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
                  <div className="
                    mb-3 flex items-center gap-2 text-sm text-gray-400
                    dark:text-gray-500
                  ">
                    <time>
                      {new Date(post.created_at).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </time>
                    {post.reading_time_minutes != null && (
                      <>
                        <span>&middot;</span>
                        <span>{post.reading_time_minutes} min read</span>
                      </>
                    )}
                  </div>
                  <p className="
                    text-gray-500
                    dark:text-gray-400
                  ">
                    {post.excerpt}
                  </p>
                </Link>
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/tags/${encodeURIComponent(tag)}`}
                        className="
                          rounded-full bg-gray-100 px-2 py-0.5 text-xs
                          text-gray-600 no-underline transition-colors
                          hover:bg-blue-100 hover:text-blue-600
                          dark:bg-gray-800 dark:text-gray-400
                          dark:hover:bg-blue-900/30 dark:hover:text-blue-400
                        "
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex justify-end pt-3">
                  <LikeButton postId={post.id} />
                </div>
              </li>
            ))}
          </ul>
          <div ref={sentinelRef} className="h-1" />
        </>
      )}
    </main>
  )
}
