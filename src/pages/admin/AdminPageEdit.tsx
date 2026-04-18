import { useState } from 'react'
import { useParams } from 'react-router'
import {
  useGetPageByIdQuery,
  useUpdatePageMutation,
} from '@/store/api'
import PostForm from '@/components/admin/PostForm'

export default function AdminPageEdit() {
  const { id } = useParams<{ id: string }>()
  const {
    data: page,
    isLoading,
    error: fetchError,
  } = useGetPageByIdQuery(Number(id))
  const [updatePage] = useUpdatePageMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: {
    title: string
    slug: string
    content: string
  }) {
    setIsSubmitting(true)
    setError(null)
    try {
      await updatePage({ id: Number(id), changes: data }).unwrap()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update page',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return null

  if (fetchError || !page) {
    return <p className="text-red-500">Page not found.</p>
  }

  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Edit Page</h1>
      {error && (
        <p className="
          mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600
          dark:bg-red-900/20 dark:text-red-400
        ">
          {error}
        </p>
      )}
      <PostForm
        variant="page"
        initialData={page}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
