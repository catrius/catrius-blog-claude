import { useGetAllTagsQuery } from '@/store/api';
import { SITE_NAME } from '@/constants';
import TagPill from '@/components/TagPill';

export default function TagsIndex() {
  const { data: tags = [], isLoading, error } = useGetAllTagsQuery();

  if (isLoading) {
    return (
      <div>
        <div data-skeleton className="mb-6 h-9 w-24" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              data-skeleton
              className="h-8 rounded-full"
              style={{ width: `${60 + (i % 4) * 20}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading tags.</p>;
  }

  return (
    <div>
      <title>{`Tags | ${SITE_NAME}`}</title>
      <h1 className="
        mb-6 flex items-center gap-3 font-heading text-3xl font-bold
      ">
        <span className="
          inline-block h-8 w-1 rounded-full bg-linear-to-b from-blue-500
          via-purple-500 to-pink-500
        " />
        Tags
      </h1>
      {tags.length === 0 ? (
        <div className="py-16 text-center">
          <svg
            className="
              mx-auto mb-4 size-16 text-gray-300
              dark:text-slate-600
            "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
          <p className="
            mb-2 text-lg font-medium text-gray-500
            dark:text-slate-400
          ">No tags yet</p>
          <p className="
            text-sm text-gray-400
            dark:text-slate-500
          ">Tags will appear once posts are published.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <TagPill key={tag} tag={tag} size="lg" count={count} />
          ))}
        </div>
      )}
    </div>
  );
}
