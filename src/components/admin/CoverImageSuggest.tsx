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

  async function handleSuggest() {
    if (!query.trim() || !accessToken) return;

    setLoading(true);
    setImages([]);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Search failed');
      const data = (await res.json()) as { images: UnsplashImage[] };
      setImages(data.images);
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
          dark:border-gray-600 dark:text-gray-400
          dark:hover:border-blue-400 dark:hover:text-blue-400
        "
      >
        {loading ? 'Searching…' : 'Suggest Cover Image'}
      </button>

      {images.length > 0 && (
        <div
          className="
            mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4
            dark:border-gray-700 dark:bg-gray-800/50
          "
        >
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
              dark:text-gray-500
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
