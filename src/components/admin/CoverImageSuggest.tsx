import { useState } from 'react';

interface UnsplashImage {
  id: string;
  thumb: string;
  full: string;
  alt: string | null;
  photographer: string;
  photographerUrl: string;
}

interface CoverImageSuggestProps {
  query: string;
  accessToken: string | undefined;
  onSelect: (blobUrl: string) => void;
}

export default function CoverImageSuggest({ query, accessToken, onSelect }: CoverImageSuggestProps) {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [maxPage, setMaxPage] = useState(20);

  async function fetchImages(q: string, page: number): Promise<UnsplashImage[]> {
    const res = await fetch(
      `/api/unsplash?q=${encodeURIComponent(q)}&page=${page}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!res.ok) throw new Error('Search failed');
    const data = (await res.json()) as { images: UnsplashImage[] };
    return data.images;
  }

  async function handleSuggest() {
    if (!query.trim() || !accessToken) return;

    const trimmedQuery = query.trim();
    const randomPage = Math.floor(Math.random() * maxPage) + 1;

    setLoading(true);
    try {
      let results = await fetchImages(trimmedQuery, randomPage);

      if (results.length === 0 && randomPage > 1) {
        const smallerMax = Math.max(1, randomPage - 1);
        setMaxPage(smallerMax);
        const fallbackPage = Math.floor(Math.random() * smallerMax) + 1;
        results = await fetchImages(trimmedQuery, fallbackPage);
      }

      setImages(results);
    } catch {
      alert('Failed to search Unsplash.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(image: UnsplashImage) {
    if (!accessToken) return;
    setSaving(image.id);
    try {
      const res = await fetch(`/api/cover-from-url?url=${encodeURIComponent(image.full)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Upload failed');
      const blob = (await res.json()) as { url: string };
      onSelect(blob.url);
      setImages([]);
    } catch {
      alert('Failed to save image.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSuggest}
        disabled={!query.trim() || loading}
        className="
          cursor-pointer rounded-md border border-dashed border-gray-300 px-3
          py-1.5 text-sm text-gray-600
          hover:border-blue-400 hover:text-blue-600
          disabled:cursor-not-allowed disabled:opacity-40
          dark:border-slate-600 dark:text-slate-400
          dark:hover:border-blue-400 dark:hover:text-blue-400
        "
      >
        {loading ? 'Searching…' : 'Suggest Cover Image'}
      </button>

      {(images.length > 0 || loading) && (
        <div
          className="
            relative mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4
            dark:border-slate-700 dark:bg-slate-800/50
          "
        >
          {loading && (
            <div
              className="
                absolute inset-0 z-10 flex items-center justify-center
                rounded-lg bg-white/70 dark:bg-slate-900/70
              "
            >
              <svg
                className="size-8 animate-spin text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
          <div
            className="
              grid grid-cols-2 gap-2
              sm:grid-cols-3
              md:grid-cols-4
            "
          >
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleSelect(img)}
                disabled={saving !== null}
                className="
                  group relative cursor-pointer overflow-hidden rounded-md
                  disabled:cursor-wait disabled:opacity-60
                "
              >
                <img
                  src={img.thumb}
                  alt={img.alt ?? ''}
                  className="
                    aspect-3/2 w-full object-cover transition
                    group-hover:scale-105
                  "
                />
                {saving === img.id && (
                  <div
                    className="
                      absolute inset-0 flex items-center justify-center
                      bg-black/50
                    "
                  >
                    <span className="text-sm font-medium text-white">Saving…</span>
                  </div>
                )}
                <div
                  className="
                    pointer-events-none absolute inset-x-0 bottom-0
                    bg-linear-to-t from-black/70 to-transparent p-1.5 opacity-0
                    transition
                    group-hover:opacity-100
                  "
                >
                  <p className="truncate text-xs text-white">{img.photographer}</p>
                </div>
              </button>
            ))}
          </div>
          <p
            className="
              mt-2 text-xs text-gray-400
              dark:text-slate-500
            "
          >
            Photos from{' '}
            <a
              href="https://unsplash.com/?utm_source=catrius_blog&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Unsplash
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
