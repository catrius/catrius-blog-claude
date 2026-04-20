import { useEffect, useRef, useState } from 'react';
import type { TocHeading } from '@/lib/extractHeadings';

const MIN_HEADINGS = 3;

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (headings.length < MIN_HEADINGS) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <div ref={panelRef} className="fixed right-6 bottom-6 z-50">
      {open && (
        <nav
          aria-label="Table of contents"
          className="
            absolute right-0 bottom-14 w-72 rounded-lg border border-gray-200
            bg-white p-4 shadow-lg
            dark:border-slate-700 dark:bg-slate-800
          "
        >
          <h2
            className="
              mb-2 font-heading text-sm font-semibold tracking-wide
              text-gray-500 uppercase
              dark:text-slate-400
            "
          >
            Table of Contents
          </h2>
          <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
            {headings.map((heading, index) => (
              <li
                key={index}
                style={{ paddingLeft: `${(heading.level - minLevel) * 0.75}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  className="
                    block rounded-sm px-1.5 py-0.5 text-gray-600 no-underline
                    transition-colors
                    hover:bg-gray-100 hover:text-blue-600
                    dark:text-slate-300
                    dark:hover:bg-slate-700 dark:hover:text-blue-400
                  "
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle table of contents"
        className="
          flex size-11 cursor-pointer items-center justify-center rounded-full
          border border-gray-200 bg-white shadow-md transition-colors
          hover:bg-gray-100
          dark:border-slate-600 dark:bg-slate-800
          dark:hover:bg-slate-700
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="
            size-5 text-gray-600
            dark:text-slate-300
          "
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="15" y2="12" />
          <line x1="3" y1="18" x2="12" y2="18" />
        </svg>
      </button>
    </div>
  );
}
