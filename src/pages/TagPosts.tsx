import { useState } from 'react';
import { useParams } from 'react-router';
import { useGetPostsByTagQuery, PAGE_SIZE } from '@/store/api';
import { SITE_NAME } from '@/constants';
import PostList from '@/pages/PostList';

export default function TagPosts() {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag!);
  const [offset, setOffset] = useState(0);

  const { data, isFetching, isLoading, error } = useGetPostsByTagQuery({
    tag: decodedTag,
    offset,
    limit: PAGE_SIZE,
  });

  const handleLoadMore = () => {
    if (data && !isFetching && data.hasMore) {
      setOffset(data.posts.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-w-0 flex-1">
        <div data-skeleton className="mb-6 h-9 w-48" />
        <ul
          className="
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {Array.from({ length: 3 }, (_, i) => (
            <li
              key={i}
              className="
                overflow-hidden rounded-lg shadow-md
                dark:bg-slate-800/50
              "
            >
              <div data-skeleton className="aspect-2/1 w-full" />
              <div className="p-6">
                <div data-skeleton className="mb-3 h-6 w-3/4" />
                <div data-skeleton className="mb-3 h-4 w-1/3" />
                <div data-skeleton className="h-4 w-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading posts.</p>;
  }

  return (
    <div>
      <title>{`Tag: ${decodedTag} | ${SITE_NAME}`}</title>
      <PostList
        posts={data?.posts ?? []}
        title={`Tag: ${decodedTag}`}
        hasMore={data?.hasMore ?? false}
        isFetching={isFetching}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
