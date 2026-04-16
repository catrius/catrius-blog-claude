import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router'
import { useGetPostQuery } from '../store/api'

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, error } = useGetPostQuery(slug!)

  if (isLoading) {
    return <p>Loading post...</p>
  }

  if (error || !post) {
    return (
      <>
        <p className="text-red-500">Post not found.</p>
        <Link to="/" className="text-blue-500 hover:underline">&larr; Back to posts</Link>
      </>
    )
  }

  return (
    <article>
      <Link to="/" className="inline-block mb-6 text-blue-500 hover:underline">
        &larr; Back to posts
      </Link>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <time className="block text-sm text-gray-400 mb-6 dark:text-gray-500">
        {new Date(post.created_at).toLocaleDateString()}
      </time>
      <div className="prose dark:prose-invert max-w-none">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  )
}
