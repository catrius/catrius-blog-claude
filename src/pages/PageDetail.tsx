import Markdown from 'react-markdown'
import { useParams } from 'react-router'
import { useGetPageQuery } from '../store/api'

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: page, isLoading, error } = useGetPageQuery(slug!)

  if (isLoading) {
    return null
  }

  if (error || !page) {
    return <p className="text-red-500">Page not found.</p>
  }

  return (
    <article>
      <h1 className="mb-6 text-3xl font-bold">{page.title}</h1>
      <div className="
        prose max-w-none
        dark:prose-invert
      ">
        <Markdown>{page.content}</Markdown>
      </div>
    </article>
  )
}
