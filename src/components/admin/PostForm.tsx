import { useState } from 'react'
import { useGetCategoriesQuery } from '@/store/api'
import { useAuth } from '@/hooks/useAuth'
import type { Tables } from '@/types/database'
import ContentEditor from '@/components/admin/ContentEditor'

interface PostFormProps {
  variant?: 'post' | 'page'
  initialData?: Tables<'post'> | Tables<'page'>
  onSubmit: (data: {
    title: string
    slug: string
    excerpt?: string
    content: string
    category_id?: number | null
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
  variant = 'post',
  initialData,
  onSubmit,
  isSubmitting,
}: PostFormProps) {
  const isPost = variant === 'post'
  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !isPost })
  const { session } = useAuth()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugManual, setSlugManual] = useState(
    initialData ? slugify(initialData.title) !== initialData.slug : false,
  )
  const postData = isPost ? (initialData as Tables<'post'> | undefined) : undefined
  const [excerpt, setExcerpt] = useState(postData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(
    postData?.category_id ?? null,
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
      content,
      ...(isPost && { excerpt, category_id: categoryId }),
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
          placeholder={isPost ? 'Post title' : 'Page title'}
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
            className="
              rounded-sm border-gray-300
              dark:border-gray-600
            "
          />
          <span className="
            text-sm text-gray-600
            dark:text-gray-400
          ">
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
          className={`
            ${inputClass}
            ${!slugManual ? `
              bg-gray-50 text-gray-500
              dark:bg-gray-800 dark:text-gray-400
            ` : ''}
          `}
          placeholder={isPost ? 'post-slug' : 'page-slug'}
        />
      </div>

      {isPost && (
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
      )}

      {isPost && (
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
      )}

      <ContentEditor
        value={content}
        onChange={setContent}
        accessToken={session?.access_token}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
            text-white
            hover:bg-blue-700
            disabled:opacity-50
            dark:bg-blue-500
            dark:hover:bg-blue-600
          "
        >
          {isSubmitting
            ? 'Saving...'
            : initialData
              ? `Update ${isPost ? 'Post' : 'Page'}`
              : `Create ${isPost ? 'Post' : 'Page'}`}
        </button>
      </div>
    </form>
  )
}
