import { Link } from 'react-router'
import type { Tables } from '../types/database'

type Post = Tables<'post'>

interface PostListProps {
  posts: Post[]
  title: string
}

export default function PostList({ posts, title }: PostListProps) {
  return (
    <main className="min-w-0 flex-1">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-gray-200 p-6 hover:border-blue-500 transition-colors dark:border-gray-700"
            >
              <Link to={`/posts/${post.id}`} className="block no-underline text-inherit">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-500 mb-3 dark:text-gray-400">{post.excerpt}</p>
                <time className="text-sm text-gray-400 dark:text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
