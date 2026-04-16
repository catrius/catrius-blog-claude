import { useState } from 'react'
import { useParams } from 'react-router'
import {
  useGetPostsQuery,
  useGetPostCountsQuery,
  useGetCategoriesQuery,
  PAGE_SIZE,
} from '../store/api'
import NavBar from '../components/NavBar'
import PostList from './PostList'

export default function Home() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategoriesQuery()
  const { data: postCounts } = useGetPostCountsQuery()

  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null
  const categoryId = selectedCategory?.id ?? null

  const [offset, setOffset] = useState(0)
  const [prevCategoryId, setPrevCategoryId] = useState(categoryId)

  if (categoryId !== prevCategoryId) {
    setPrevCategoryId(categoryId)
    setOffset(0)
  }

  const {
    data,
    isLoading: postsLoading,
    isFetching,
    error: postsError,
  } = useGetPostsQuery({ offset, limit: PAGE_SIZE, categoryId })

  const handleLoadMore = () => {
    if (data && !isFetching && data.hasMore) {
      setOffset(data.posts.length)
    }
  }

  if (postsLoading || categoriesLoading) {
    return <p>Loading posts...</p>
  }

  if (postsError) {
    return <p className="text-red-500">Error loading posts.</p>
  }

  const postCountsByCategory = new Map<number, number>()
  if (postCounts) {
    for (const [catId, count] of Object.entries(postCounts.countsByCategory)) {
      postCountsByCategory.set(Number(catId), count)
    }
  }

  const title = selectedCategory?.name ?? 'Posts'

  return (
    <div>
      {/* Hidden on mobile — categories are in the sidebar */}
      <NavBar
        categories={categories}
        postCountsByCategory={postCountsByCategory}
        totalPostCount={postCounts?.total ?? 0}
        selectedCategorySlug={categorySlug ?? null}
      />
      <PostList
        posts={data?.posts ?? []}
        title={title}
        hasMore={data?.hasMore ?? false}
        isFetching={isFetching}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
