import { useState } from 'react';
import { useGetCategoriesQuery } from '@/store/api';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
import ContentEditor from '@/components/admin/ContentEditor';
import CoverImageSuggest from '@/components/admin/CoverImageSuggest';

interface PostFormProps {
  variant?: 'post' | 'page';
  initialData?: Tables<'post'> | Tables<'page'>;
  onSubmit: (data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    category_id?: number | null;
    cover_image?: string | null;
    tags?: string[];
  }) => Promise<void>;
  isSubmitting: boolean;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function PostForm({ variant = 'post', initialData, onSubmit, isSubmitting }: PostFormProps) {
  const isPost = variant === 'post';
  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !isPost });
  const { session } = useAuth();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const postData = isPost ? (initialData as Tables<'post'> | undefined) : undefined;
  const [excerpt, setExcerpt] = useState(postData?.excerpt ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(postData?.category_id ?? null);
  const [coverImage, setCoverImage] = useState<string | null>(postData?.cover_image ?? null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [tagsInput, setTagsInput] = useState(postData?.tags.join(', ') ?? '');
  const [generatingTags, setGeneratingTags] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
  }

  async function handleGenerateTags() {
    setGeneratingTags(true);
    try {
      const { data, error } = await supabase.rpc('generate_tags', {
        p_title: title,
        p_excerpt: excerpt,
        p_content: content,
      });
      if (error) throw error;
      setTagsInput((data as string[]).join(', '));
    } catch {
      alert('Failed to generate tags.');
    } finally {
      setGeneratingTags(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session?.access_token) return;
    setCoverUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: file,
      });
      if (!res.ok) throw new Error('Upload failed');
      const blob = (await res.json()) as { url: string };
      setCoverImage(blob.url);
    } catch {
      alert('Cover image upload failed.');
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    await onSubmit({
      title,
      slug,
      content,
      ...(isPost && { excerpt, category_id: categoryId, cover_image: coverImage, tags: parsedTags }),
    });
  }

  const inputClass = `
    w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
    text-gray-900 placeholder-gray-400
    focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
    dark:border-gray-700 dark:bg-gray-900 dark:text-white
    dark:placeholder-gray-500
    dark:focus:border-blue-400 dark:focus:ring-blue-400
  `;

  const generateBtnClass = `
    shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white px-3
    py-2 text-sm text-gray-700
    hover:bg-gray-50
    disabled:cursor-not-allowed disabled:opacity-40
    dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300
    dark:hover:bg-gray-700
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isPost && (
        <div>
          <label
            htmlFor="cover-image"
            className="
              mb-1 block text-sm font-medium text-gray-700
              dark:text-gray-300
            "
          >
            Cover Image
          </label>
          {coverImage && (
            <div className="mb-2 space-y-3">
              <div>
                <p
                  className="
                    mb-1 text-xs text-gray-500
                    dark:text-gray-400
                  "
                >
                  Post list card (2:1)
                </p>
                <img
                  src={coverImage}
                  alt="Cover preview – post list"
                  className="aspect-2/1 max-w-xs rounded-md object-cover"
                />
              </div>
              <div>
                <p
                  className="
                    mb-1 text-xs text-gray-500
                    dark:text-gray-400
                  "
                >
                  Post detail (3:1)
                </p>
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover preview – post detail"
                    className="aspect-3/1 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="
                      absolute top-1 right-1 cursor-pointer rounded-full
                      bg-black/60 p-1 text-white
                      hover:bg-black/80
                    "
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          <input
            id="cover-image"
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={coverUploading}
            className="
              block w-full text-sm text-gray-500
              file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3
              file:py-1.5 file:text-sm file:font-medium file:text-blue-700
              hover:file:bg-blue-100
              dark:text-gray-400
              dark:file:bg-blue-900/30 dark:file:text-blue-300
            "
          />
          {coverUploading && (
            <p className="
              mt-1 text-sm text-blue-600
              dark:text-blue-400
            ">Uploading…</p>
          )}
          <div className="mt-2">
            <CoverImageSuggest
              query={tagsInput || title}
              accessToken={session?.access_token}
              onSelect={setCoverImage}
            />
          </div>
        </div>
      )}

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
          htmlFor="slug"
          className="
            mb-1 block text-sm font-medium text-gray-700
            dark:text-gray-300
          "
        >
          Slug
        </label>
        <div className="flex gap-2">
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={inputClass}
            placeholder={isPost ? 'post-slug' : 'page-slug'}
          />
          <button
            type="button"
            onClick={() => setSlug(slugify(title))}
            disabled={!title.trim()}
            className={generateBtnClass}
          >
            Generate
          </button>
        </div>
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
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
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

      {isPost && (
        <div>
          <label
            htmlFor="tags"
            className="
              mb-1 block text-sm font-medium text-gray-700
              dark:text-gray-300
            "
          >
            Tags
          </label>
          <div className="flex gap-2">
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className={inputClass}
              placeholder="react, typescript, web-dev"
            />
            <button
              type="button"
              onClick={handleGenerateTags}
              disabled={generatingTags || !title.trim()}
              className={generateBtnClass}
            >
              {generatingTags ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>
      )}

      <ContentEditor value={content} onChange={setContent} accessToken={session?.access_token} />

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
  );
}
