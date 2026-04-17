import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCreatePageMutation } from '@/store/api'
import PostForm from '@/components/admin/PostForm'

export default function AdminPageNew() {
  const navigate = useNavigate()
  const [createPage] = useCreatePageMutation()
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
      await createPage(data).unwrap()
      navigate('/admin')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create page',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-2xl font-bold">New Page</h1>
      {error && (
        <p className="
          mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600
          dark:bg-red-900/20 dark:text-red-400
        ">
          {error}
        </p>
      )}
      <PostForm variant="page" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
