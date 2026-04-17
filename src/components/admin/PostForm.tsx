import { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { useGetCategoriesQuery } from '../../store/api'
import type { Tables } from '../../types/database'

type Post = Tables<'post'>

interface PostFormProps {
  initialData?: Post
  onSubmit: (data: {
    title: string
    slug: string
    excerpt: string
    content: string
    category_id: number | null
  }) => Promise<void>
  isSubmitting: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

export default function PostForm({
  initialData,
  onSubmit,
  isSubmitting,
}: PostFormProps) {
  const { data: categories = [] } = useGetCategoriesQuery()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!initialData)
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(
    initialData?.category_id ?? null,
  )

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManual) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      title,
      slug,
      excerpt,
      content,
      category_id: categoryId,
    })
  }

  const inputClass = `
    w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
    text-gray-900 placeholder-gray-400
    focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
    dark:border-gray-700 dark:bg-gray-900 dark:text-white
    dark:placeholder-gray-500
    dark:focus:border-blue-400 dark:focus:ring-blue-400
  `

  return (
    <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-10rem)] flex-col gap-5">
      <div>
        <label
          htmlFor="title"
          className="
            mb-1 block text-sm font-medium text-gray-700
            dark:text-gray-300
          "
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
          placeholder="Post title"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <label
            htmlFor="slug"
            className="
              text-sm font-medium text-gray-700
              dark:text-gray-300
            "
          >
            Slug
          </label>
          {!initialData && (
            <button
              type="button"
              onClick={() => setSlugManual(!slugManual)}
              className="
                text-xs text-gray-400
                hover:text-gray-600
                dark:hover:text-gray-300
              "
            >
              {slugManual ? 'Auto' : 'Manual'}
            </button>
          )}
        </div>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugManual(true)
          }}
          className={inputClass}
          placeholder="post-slug"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="
            mb-1 block text-sm font-medium text-gray-700
            dark:text-gray-300
          "
        >
          Excerpt
        </label>
        <textarea
          id="excerpt"
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={inputClass}
          placeholder="Brief description of the post"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="
            mb-1 block text-sm font-medium text-gray-700
            dark:text-gray-300
          "
        >
          Category
        </label>
        <select
          id="category"
          value={categoryId ?? ''}
          onChange={(e) =>
            setCategoryId(e.target.value ? Number(e.target.value) : null)
          }
          className={inputClass}
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div data-color-mode="light" className="flex min-h-0 flex-1 flex-col dark:hidden">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Content
        </label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height="100%"
          style={{ flex: 1 }}
        />
      </div>
      <div data-color-mode="dark" className="hidden min-h-0 flex-1 flex-col dark:flex">
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Content
        </label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height="100%"
          style={{ flex: 1 }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
            hover:bg-blue-700
            disabled:opacity-50
            dark:bg-blue-500
            dark:hover:bg-blue-600
          "
        >
          {isSubmitting
            ? 'Saving...'
            : initialData
              ? 'Update Post'
              : 'Create Post'}
        </button>
      </div>
    </form>
  )
}
