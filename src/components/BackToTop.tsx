import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`
        fixed right-6 bottom-6 z-40 flex size-10 cursor-pointer items-center
        justify-center rounded-full bg-gray-900/80 text-white shadow-lg
        backdrop-blur-sm transition-all duration-300
        hover:bg-gray-900 hover:shadow-xl
        dark:bg-slate-100/80 dark:text-slate-900
        dark:hover:bg-slate-100
        ${visible ? 'translate-y-0 opacity-100' : `
          pointer-events-none translate-y-4 opacity-0
        `}
      `}
    >
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
