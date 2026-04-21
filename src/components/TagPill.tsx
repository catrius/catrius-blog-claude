import { Link } from 'react-router';

interface TagPillProps {
  tag: string;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
}

const base = `
  rounded-full bg-linear-to-r from-gray-100 to-gray-50 no-underline
  hover:from-purple-100 hover:to-purple-50 hover:text-purple-600
  dark:from-slate-800 dark:to-slate-700
  dark:hover:from-purple-900/30 dark:hover:to-purple-800/20
  dark:hover:text-purple-400
`;

const sizes = {
  sm: 'px-2.5 py-0.5 text-xs text-gray-600 transition-colors dark:text-slate-400',
  md: 'px-3 py-0.5 text-sm text-gray-600 transition-colors dark:text-slate-400',
  lg: 'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm text-gray-700 shadow-sm transition-all hover:shadow-md dark:text-slate-300',
};

export default function TagPill({ tag, size = 'sm', count }: TagPillProps) {
  return (
    <Link
      to={`/tags/${encodeURIComponent(tag)}`}
      className={`
        ${base}
        ${sizes[size]}
      `}
    >
      <span
        className={`
          text-gray-400
          dark:text-slate-500
          ${size !== 'lg' ? 'mr-0.5' : ''}
        `}
      >#</span>{tag}
      {count !== undefined && (
        <span
          className="
            text-xs text-gray-400
            dark:text-slate-500
          "
        >
          {count}
        </span>
      )}
    </Link>
  );
}
