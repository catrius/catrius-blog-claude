import { useState } from 'react'
import { useParams } from 'react-router'
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from '@/store/api'
import PostForm from '@/components/admin/PostForm'

export default function AdminPostEdit() {
  const { id } = useParams<{ id: string }>()
  const {
    data: post,
    isLoading,
    error: fetchError,
  } = useGetPostByIdQuery(Number(id))
  const [updatePost] = useUpdatePostMutation()
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
      await updatePost({
        id: Number(id),
        changes: {
          ...data,
          excerpt: data.excerpt ?? '',
          category_id: data.category_id ?? null,
        },
      }).unwrap()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update post',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return null

  if (fetchError || !post) {
    return <p className="text-red-500">Post not found.</p>
  }

  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Edit Post</h1>
      {error && (
        <p className="
          mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600
          dark:bg-red-900/20 dark:text-red-400
        ">
          {error}
        </p>
      )}
      <PostForm
        initialData={post}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
