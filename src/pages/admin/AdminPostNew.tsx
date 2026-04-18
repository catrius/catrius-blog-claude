import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCreatePostMutation } from '@/store/api'
import PostForm from '@/components/admin/PostForm'

export default function AdminPostNew() {
  const navigate = useNavigate()
  const [createPost] = useCreatePostMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: {
    title: string
    slug: string
    excerpt?: string
    content: string
    category_id?: number | null
  }) {
    setIsSubmitting(true)
    setError(null)
    try {
      await createPost({
        ...data,
        excerpt: data.excerpt ?? '',
        category_id: data.category_id ?? null,
      }).unwrap()
      navigate(`/posts/${data.slug}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create post',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-2xl font-bold">New Post</h1>
      {error && (
        <p className="
          mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600
          dark:bg-red-900/20 dark:text-red-400
        ">
          {error}
        </p>
      )}
      <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
