import { useState } from 'react'
import { useGetPostsQuery, useGetCategoriesQuery } from '../store/api'
import NavBar from '../components/NavBar'
import PostList from './PostList'

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const { data: posts = [], isLoading: postsLoading, error: postsError } = useGetPostsQuery()
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery()

  if (postsLoading || categoriesLoading) {
    return <p>Loading posts...</p>
  }

  if (postsError) {
    return <p className="text-red-500">Error loading posts.</p>
  }

  const filteredPosts = selectedCategoryId
    ? posts.filter((post) => post.category_id === selectedCategoryId)
    : posts

  const postCountsByCategory = new Map<number, number>()
  for (const post of posts) {
    if (post.category_id != null) {
      postCountsByCategory.set(post.category_id, (postCountsByCategory.get(post.category_id) ?? 0) + 1)
    }
  }

  const title = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Posts'
    : 'Posts'

  return (
    <div>
      <NavBar
        categories={categories}
        postCountsByCategory={postCountsByCategory}
        totalPostCount={posts.length}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <PostList posts={filteredPosts} title={title} />
    </div>
  )
}
