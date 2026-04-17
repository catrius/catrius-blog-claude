import { useState, useSyncExternalStore } from 'react'
import MDEditor, { type ICommand } from '@uiw/react-md-editor'
import { useGetCategoriesQuery } from '@/store/api'
import { useAuth } from '@/lib/AuthContext'
import type { Tables } from '@/types/database'

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

async function uploadImage(
  file: File,
  accessToken: string,
): Promise<string> {
  const res = await fetch(
    `/api/upload?filename=${encodeURIComponent(file.name)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: file,
    },
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error ?? 'Upload failed')
  }
  const blob = (await res.json()) as { url: string }
  return blob.url
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
  const isMobile = useSyncExternalStore(subscribeToMedia, getIsMobile, getIsMobileServer)
  const [mobilePreview, setMobilePreview] = useState<'edit' | 'preview'>('edit')
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
  const [uploading, setUploading] = useState(false)

  function getEditorCursorPos(node: HTMLElement): number | undefined {
    const textarea = node.querySelector('textarea')
    return textarea?.selectionStart ?? undefined
  }

  async function handleImageFile(file: File, cursorPos?: number) {
    const token = session?.access_token
    if (!token) return

    const alt = file.name.replace(/\.[^.]+$/, '')
    const placeholder = `![Uploading ${alt}…]()`
    setContent((prev) => {
      const pos = cursorPos ?? prev.length
      return prev.slice(0, pos) + placeholder + prev.slice(pos)
    })
    setUploading(true)
    try {
      const url = await uploadImage(file, token)
      setContent((prev) =>
        prev.replace(placeholder, `![${alt}](${url})`),
      )
    } catch {
      setContent((prev) => prev.replace(placeholder, ''))
      alert('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const pos = getEditorCursorPos(e.currentTarget as HTMLElement)
          handleImageFile(file, pos)
        }
        return
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    const files = e.dataTransfer?.files
    if (!files?.length) return
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        e.preventDefault()
        const pos = getEditorCursorPos(e.currentTarget as HTMLElement)
        handleImageFile(file, pos)
        return
      }
    }
  }

  const imageUploadCommand: ICommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image', title: 'Upload image' },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
      </svg>
    ),
    execute: (state) => {
      const cursorPos = state.selection.start
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        const file = input.files?.[0]
        if (file) handleImageFile(file, cursorPos)
      }
      input.click()
    },
  }

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

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="
            text-sm font-medium text-gray-700
            dark:text-gray-300
          ">
            Content
          </label>
          {isMobile && (
            <div className="
              flex gap-1 rounded-md border border-gray-300 p-0.5
              dark:border-gray-600
            ">
              <button
                type="button"
                onClick={() => setMobilePreview('edit')}
                className={`
                  rounded-sm px-2.5 py-0.5 text-xs font-medium
                  ${
                  mobilePreview === 'edit'
                    ? `
                      bg-blue-600 text-white
                      dark:bg-blue-500
                    `
                    : `
                      text-gray-600
                      dark:text-gray-400
                    `
                }
                `}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setMobilePreview('preview')}
                className={`
                  rounded-sm px-2.5 py-0.5 text-xs font-medium
                  ${
                  mobilePreview === 'preview'
                    ? `
                      bg-blue-600 text-white
                      dark:bg-blue-500
                    `
                    : `
                      text-gray-600
                      dark:text-gray-400
                    `
                }
                `}
              >
                Preview
              </button>
            </div>
          )}
        </div>
        {uploading && (
          <p className="
            mb-1 text-sm text-blue-600
            dark:text-blue-400
          ">
            Uploading image…
          </p>
        )}
        <div
          data-color-mode="light"
          className="dark:hidden"
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={700}
            preview={editorPreview}
            extraCommands={[imageUploadCommand]}
          />
        </div>
        <div
          data-color-mode="dark"
          className="
            hidden
            dark:block
          "
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={700}
            preview={editorPreview}
            extraCommands={[imageUploadCommand]}
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
              ? `Update ${isPost ? 'Post' : 'Page'}`
              : `Create ${isPost ? 'Post' : 'Page'}`}
        </button>
      </div>
    </form>
  )
}
