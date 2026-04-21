import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

const buttonBase = `
  inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3
  py-1.5 text-sm transition-colors
`;

const buttonDefault = `
  border-gray-200 bg-white text-gray-500
  hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500
  dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400
  dark:hover:border-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-400
`;

const buttonCopied = `
  border-green-200 bg-green-50 text-green-600
  dark:border-green-800 dark:bg-green-950/50 dark:text-green-400
`;

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  async function handleNativeShare() {
    try {
      await navigator.share({ url, title });
    } catch {
      // User cancelled or share failed — no action needed
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareX() {
    window.open(
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  function handleShareBluesky() {
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(title + ' ' + url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  if (canNativeShare) {
    return (
      <button
        onClick={handleNativeShare}
        aria-label="Share this post"
        className={`
          ${buttonBase}
          ${buttonDefault}
        `}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3v11.25"
          />
        </svg>
        Share
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className={`
          ${buttonBase}
          ${copied ? buttonCopied : buttonDefault}
        `}
      >
        {copied ? (
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>
        )}
        {copied ? 'Copied!' : 'Copy link'}
      </button>

      <button
        onClick={handleShareX}
        aria-label="Share on X"
        className={`
          ${buttonBase}
          ${buttonDefault}
        `}
      >
        <svg className="size-4" viewBox="0 0 19 19" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <button
        onClick={handleShareBluesky}
        aria-label="Share on Bluesky"
        className={`
          ${buttonBase}
          ${buttonDefault}
        `}
      >
        <svg className="size-4" viewBox="0 0 16 17" fill="currentColor">
          <path d="M7.75 7.735c-.693-1.348-2.58-3.86-4.334-5.097-1.68-1.187-2.32-.981-2.74-.79C.188 2.065.1 2.812.1 3.251s.241 3.602.398 4.13c.52 1.744 2.367 2.333 4.07 2.145-2.495.37-4.71 1.278-1.805 4.512 3.196 3.309 4.38-.71 4.987-2.746.608 2.036 1.307 5.91 4.93 2.746 2.72-2.746.747-4.143-1.747-4.512 1.702.189 3.55-.4 4.07-2.145.156-.528.397-3.691.397-4.13s-.088-1.186-.575-1.406c-.42-.19-1.06-.395-2.741.79-1.755 1.24-3.64 3.752-4.334 5.099" />
        </svg>
      </button>
    </div>
  );
}
