import { Link } from 'react-router';
import { useGetAllTagsQuery } from '@/store/api';
import { SITE_NAME } from '@/constants';

export default function TagsIndex() {
  const { data: tags = [], isLoading, error } = useGetAllTagsQuery();

  if (isLoading) {
    return null;
  }

  if (error) {
    return <p className="text-red-500">Error loading tags.</p>;
  }

  return (
    <div>
      <title>{`Tags | ${SITE_NAME}`}</title>
      <h1 className="mb-6 text-3xl font-bold">Tags</h1>
      {tags.length === 0 ? (
        <p
          className="
            text-gray-500
            dark:text-gray-400
          "
        >
          No tags yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="
                inline-flex items-center gap-1.5 rounded-full border
                border-gray-200 px-3 py-1.5 text-sm text-gray-700 no-underline
                transition-colors
                hover:border-blue-500 hover:text-blue-600
                dark:border-gray-700 dark:text-gray-300
                dark:hover:border-blue-400 dark:hover:text-blue-400
              "
            >
              {tag}
              <span
                className="
                  text-xs text-gray-400
                  dark:text-gray-500
                "
              >
                {count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
