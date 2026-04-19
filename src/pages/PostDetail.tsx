import { useState } from 'react'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { Link, useNavigate, useParams } from 'react-router'
import { useGetPostQuery, useDeletePostMutation } from '@/store/api'
import { SITE_NAME } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog'

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: post, isLoading, error } = useGetPostQuery(slug!)
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleDelete() {
    if (!post) return
    await deletePost(post.id)
    setShowDeleteDialog(false)
    navigate('/')
  }

  if (isLoading) {
    return null
  }

  if (error || !post) {
    return <p className="text-red-500">Post not found.</p>
  }

  return (
    <article>
      <title>{`${post.title} | ${SITE_NAME}`}</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:type" content="article" />
      {isAdmin && (
        <div className="mb-4 flex gap-2">
          <Link
            to={`/admin/posts/${post.id}/edit`}
            className="
              rounded-sm bg-blue-50 px-3 py-1 text-sm text-blue-700 no-underline
              hover:bg-blue-100
              dark:bg-blue-900/30 dark:text-blue-300
              dark:hover:bg-blue-900/50
            "
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="
              cursor-pointer rounded-sm bg-red-50 px-3 py-1 text-sm text-red-700
              hover:bg-red-100
              dark:bg-red-900/30 dark:text-red-300
              dark:hover:bg-red-900/50
            "
          >
            Delete
          </button>
        </div>
      )}
      <h1 className="mb-2 text-3xl font-bold">{post.title}</h1>
      <div className="
        mb-6 flex items-center gap-2 text-sm text-gray-400
        dark:text-gray-500
      ">
        <time>{new Date(post.created_at).toLocaleDateString()}</time>
        {post.reading_time_minutes != null && (
          <>
            <span>&middot;</span>
            <span>{post.reading_time_minutes} min read</span>
          </>
        )}
      </div>
      {post.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="
                rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600
                no-underline transition-colors
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
      <div className="
        prose max-w-none
        dark:prose-invert
      ">
        <Markdown rehypePlugins={[rehypeRaw]}>{post.content}</Markdown>
      </div>

      {isAdmin && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          itemTitle={post.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
    </article>
  )
}
