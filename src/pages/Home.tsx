import { useState } from 'react';
import { useParams } from 'react-router';
import { useGetPostsQuery, useGetPostCountsQuery, useGetCategoriesQuery, PAGE_SIZE } from '@/store/api';
import { SITE_NAME } from '@/constants';
import NavBar from '@/components/NavBar';
import TrendingPosts from '@/components/TrendingPosts';
import PostList from '@/pages/PostList';

export default function Home() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: postCounts } = useGetPostCountsQuery();

  const selectedCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
  const categoryId = selectedCategory?.id ?? null;

  const [offset, setOffset] = useState(0);
  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);

  if (categoryId !== prevCategoryId) {
    setPrevCategoryId(categoryId);
    setOffset(0);
  }

  const {
    data,
    isLoading: postsLoading,
    isFetching,
    error: postsError,
  } = useGetPostsQuery({ offset, limit: PAGE_SIZE, categoryId });

  const handleLoadMore = () => {
    if (data && !isFetching && data.hasMore) {
      setOffset(data.posts.length);
    }
  };

  if (postsLoading || categoriesLoading) {
    return (
      <div>
        {/* Category bar skeleton */}
        <div
          className="
            mb-6 hidden gap-2
            md:flex
          "
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              data-skeleton
              className="h-9 shrink-0 rounded-full"
              style={{ width: `${70 + (i % 3) * 24}px` }}
            />
          ))}
        </div>

        {/* Trending skeleton */}
        <section className="mb-8">
          <div data-skeleton className="mb-4 h-6 w-32" />
          <div
            className="
              flex gap-3 overflow-hidden
              md:grid md:grid-cols-5
            "
          >
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                data-skeleton
                className="
                  aspect-4/3 w-40 shrink-0 rounded-lg
                  md:w-auto
                "
              />
            ))}
          </div>
        </section>

        {/* Post list skeleton */}
        <div className="min-w-0 flex-1">
          <div data-skeleton className="mb-6 h-9 w-32" />
          <ul
            className="
              grid grid-cols-1 gap-6
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            <li
              className="
                col-span-full flex flex-col overflow-hidden rounded-lg shadow-md
                sm:flex-row
                dark:bg-slate-800/50
              "
            >
              <div
                data-skeleton
                className="
                  aspect-2/1
                  sm:w-1/2
                "
              />
              <div
                className="
                  flex flex-1 flex-col p-6
                  sm:w-1/2
                "
              >
                <div data-skeleton className="mb-3 h-7 w-3/4" />
                <div data-skeleton className="mb-3 h-4 w-1/3" />
                <div data-skeleton className="mb-2 h-4 w-full" />
                <div data-skeleton className="h-4 w-2/3" />
              </div>
            </li>
            {Array.from({ length: 8 }, (_, i) => (
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
                  <div data-skeleton className="mb-2 h-4 w-full" />
                  <div data-skeleton className="h-4 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (postsError) {
    return <p className="text-red-500">Error loading posts.</p>;
  }

  const postCountsByCategory = new Map<number, number>();
  if (postCounts) {
    for (const [catId, count] of Object.entries(postCounts.countsByCategory)) {
      postCountsByCategory.set(Number(catId), count);
    }
  }

  const title = selectedCategory?.name ?? 'Posts';

  return (
    <div>
      {selectedCategory ? <title>{`${selectedCategory.name} | ${SITE_NAME}`}</title> : <title>{SITE_NAME}</title>}
      {/* Hidden on mobile — categories are in the sidebar */}
      <NavBar
        categories={categories}
        postCountsByCategory={postCountsByCategory}
        totalPostCount={postCounts?.total ?? 0}
        selectedCategorySlug={categorySlug ?? null}
      />
      {!selectedCategory && <TrendingPosts />}
      <PostList
        posts={data?.posts ?? []}
        title={title}
        hasMore={data?.hasMore ?? false}
        isFetching={isFetching}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
