import { useState, useSyncExternalStore } from 'react';
import MDEditor, { type ICommand } from '@uiw/react-md-editor';

const mobileQuery = '(max-width: 767px)';
function subscribeToMedia(cb: () => void) {
  const mql = window.matchMedia(mobileQuery);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
function getIsMobile() {
  return window.matchMedia(mobileQuery).matches;
}
function getIsMobileServer() {
  return false;
}

async function uploadImage(file: File, accessToken: string): Promise<string> {
  const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: file,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error ?? 'Upload failed');
  }
  const blob = (await res.json()) as { url: string };
  return blob.url;
}

interface ContentEditorProps {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  accessToken: string | undefined;
}

export default function ContentEditor({ value, onChange, accessToken }: ContentEditorProps) {
  const isMobile = useSyncExternalStore(subscribeToMedia, getIsMobile, getIsMobileServer);
  const [mobilePreview, setMobilePreview] = useState<'edit' | 'preview'>('edit');
  const [uploading, setUploading] = useState(false);

  function getEditorCursorPos(node: HTMLElement): number | undefined {
    const textarea = node.querySelector('textarea');
    return textarea?.selectionStart ?? undefined;
  }

  async function handleImageFile(file: File, cursorPos?: number) {
    if (!accessToken) return;

    const alt = file.name.replace(/\.[^.]+$/, '');
    const placeholder = `![Uploading ${alt}…]()`;
    onChange((prev) => {
      const pos = cursorPos ?? prev.length;
      return prev.slice(0, pos) + placeholder + prev.slice(pos);
    });
    setUploading(true);
    try {
      const url = await uploadImage(file, accessToken);
      onChange((prev) => prev.replace(placeholder, `<img src="${url}" alt="${alt}" width="100%" />`));
    } catch {
      onChange((prev) => prev.replace(placeholder, ''));
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const pos = getEditorCursorPos(e.currentTarget as HTMLElement);
          handleImageFile(file, pos);
        }
        return;
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const pos = getEditorCursorPos(e.currentTarget as HTMLElement);
        handleImageFile(file, pos);
        return;
      }
    }
  }

  const imageUploadCommand: ICommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image', title: 'Upload image' },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    execute: (state) => {
      const cursorPos = state.selection.start;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) handleImageFile(file, cursorPos);
      };
      input.click();
    },
  };

  const imageSizes = ['100%', '75%', '50%', '25%'];

  const imageResizeCommand: ICommand = {
    name: 'image-resize',
    keyCommand: 'image-resize',
    buttonProps: {
      'aria-label': 'Resize image',
      title: 'Resize image (place cursor inside an <img> tag)',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" />
      </svg>
    ),
    execute: (state, api) => {
      const { text } = state;
      const cursor = state.selection.start;
      const imgRegex = /<img\s[^>]*\/?>/gi;
      let match;
      let found: { start: number; end: number; tag: string } | null = null;
      while ((match = imgRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (start <= cursor && end >= cursor) {
          found = { start, end, tag: match[0] };
          break;
        }
      }
      if (!found) return;

      const widthMatch = found.tag.match(/width="([^"]*)"/);
      const current = widthMatch?.[1] ?? '100%';
      const idx = imageSizes.indexOf(current);
      const next = imageSizes[(idx + 1) % imageSizes.length];

      const newTag = widthMatch
        ? found.tag.replace(/width="[^"]*"/, `width="${next}"`)
        : found.tag.replace(/<img/, `<img width="${next}"`);

      api.setSelectionRange({ start: found.start, end: found.end });
      api.replaceSelection(newTag);
    },
  };

  const editorPreview = isMobile ? mobilePreview : 'live';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label
          className="
            text-sm font-medium text-gray-700
            dark:text-slate-300
          "
        >
          Content
        </label>
        {isMobile && (
          <div
            className="
              flex gap-1 rounded-md border border-gray-300 p-0.5
              dark:border-slate-600
            "
          >
            <button
              type="button"
              onClick={() => setMobilePreview('edit')}
              className={`
                cursor-pointer rounded-sm px-2.5 py-0.5 text-xs font-medium
                ${
                  mobilePreview === 'edit'
                    ? `
                      bg-blue-600 text-white
                      dark:bg-blue-500
                    `
                    : `
                      text-gray-600
                      dark:text-slate-400
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
                cursor-pointer rounded-sm px-2.5 py-0.5 text-xs font-medium
                ${
                  mobilePreview === 'preview'
                    ? `
                      bg-blue-600 text-white
                      dark:bg-blue-500
                    `
                    : `
                      text-gray-600
                      dark:text-slate-400
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
        <p
          className="
            mb-1 text-sm text-blue-600
            dark:text-blue-400
          "
        >
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
          value={value}
          onChange={(val) => onChange(val ?? '')}
          height={700}
          preview={editorPreview}
          extraCommands={[imageUploadCommand, imageResizeCommand]}
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
          value={value}
          onChange={(val) => onChange(val ?? '')}
          height={700}
          preview={editorPreview}
          extraCommands={[imageUploadCommand, imageResizeCommand]}
        />
      </div>
    </div>
  );
}
