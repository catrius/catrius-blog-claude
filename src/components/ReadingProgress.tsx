import { useEffect, useRef, useState } from 'react';

interface ReadingProgressProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

export default function ReadingProgress({ targetRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const rafId = useRef(0);

  useEffect(() => {
    function handleScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const el = targetRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const elTop = rect.top + window.scrollY;
        const elHeight = rect.height;
        const scrolled = window.scrollY - elTop;
        const viewportHeight = window.innerHeight;
        const total = elHeight - viewportHeight;

        if (total <= 0) {
          setProgress(100);
          return;
        }

        const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
        setProgress(pct);
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [targetRef]);

  return (
    <div
      className="
        fixed inset-x-0 top-0 z-50 h-1 bg-gray-200/50
        dark:bg-slate-800/50
      "
    >
      <div
        className="
          h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500
          transition-[width] duration-150 ease-out
        "
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
