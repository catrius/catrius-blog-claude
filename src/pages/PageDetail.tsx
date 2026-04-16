import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router'
import { useGetPageQuery } from '../store/api'

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: page, isLoading, error } = useGetPageQuery(slug!)

  if (isLoading) {
    return <p>Loading page...</p>
  }

  if (error || !page) {
    return (
      <>
        <p className="text-red-500">Page not found.</p>
        <Link to="/" className="text-blue-500 hover:underline">&larr; Back to posts</Link>
      </>
    )
  }

  return (
    <article>
      <Link to="/" className="inline-block mb-6 text-blue-500 hover:underline">
        &larr; Back to posts
      </Link>
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <Markdown>{page.content}</Markdown>
      </div>
    </article>
  )
}
