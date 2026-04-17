import { useState, useSyncExternalStore } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { useGetCategoriesQuery } from '../../store/api'
import type { Tables } from '../../types/database'

const mobileQuery = '(max-width: 767px)'
function subscribeToMedia(cb: () => void) {
  const mql = window.matchMedia(mobileQuery)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
function getIsMobile() {
  return window.matchMedia(mobileQuery).matches
}
function getIsMobileServer() {
  return false
}

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
  const isMobile = useSyncExternalStore(subscribeToMedia, getIsMobile, getIsMobileServer)
  const [mobilePreview, setMobilePreview] = useState<'edit' | 'preview'>('edit')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugManual, setSlugManual] = useState(
    initialData ? slugify(initialData.title) !== initialData.slug : false,
  )
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(
    initialData?.category_id ?? null,
  )

  const editorPreview = isMobile ? mobilePreview : 'live'

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
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <label
          htmlFor="auto-slug"
          className="
            mb-1 block text-sm font-medium text-gray-700
            dark:text-gray-300
          "
        >
          Slugify
        </label>
        <label className="flex items-center gap-2">
          <input
            id="auto-slug"
            type="checkbox"
            checked={!slugManual}
            onChange={(e) => {
              const auto = e.target.checked
              setSlugManual(!auto)
              if (auto) {
                setSlug(slugify(title))
              }
            }}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Generate slug from title
          </span>
        </label>
      </div>

      <div>
        <label
          htmlFor="slug"
          className="
            mb-1 block text-sm font-medium text-gray-700
            dark:text-gray-300
          "
        >
          Slug
        </label>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugManual(true)
          }}
          className={`${inputClass} ${!slugManual ? 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : ''}`}
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

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          {isMobile && (
            <div className="flex gap-1 rounded-md border border-gray-300 p-0.5 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setMobilePreview('edit')}
                className={`rounded px-2.5 py-0.5 text-xs font-medium ${
                  mobilePreview === 'edit'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setMobilePreview('preview')}
                className={`rounded px-2.5 py-0.5 text-xs font-medium ${
                  mobilePreview === 'preview'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Preview
              </button>
            </div>
          )}
        </div>
        <div data-color-mode="light" className="dark:hidden">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={700}
            preview={editorPreview}
          />
        </div>
        <div data-color-mode="dark" className="hidden dark:block">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={700}
            preview={editorPreview}
          />
        </div>
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
