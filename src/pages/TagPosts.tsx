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
    return null;
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
