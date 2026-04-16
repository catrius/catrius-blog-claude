import { useParams } from 'react-router'
import { useGetPostsQuery, useGetCategoriesQuery } from '../store/api'
import NavBar from '../components/NavBar'
import PostList from './PostList'

export default function Home() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const { data: posts = [], isLoading: postsLoading, error: postsError } = useGetPostsQuery()
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery()

  if (postsLoading || categoriesLoading) {
    return <p>Loading posts...</p>
  }

  if (postsError) {
    return <p className="text-red-500">Error loading posts.</p>
  }

  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category_id === selectedCategory.id)
    : posts

  const postCountsByCategory = new Map<number, number>()
  for (const post of posts) {
    if (post.category_id != null) {
      postCountsByCategory.set(post.category_id, (postCountsByCategory.get(post.category_id) ?? 0) + 1)
    }
  }

  const title = selectedCategory?.name ?? 'Posts'

  return (
    <div>
      <NavBar
        categories={categories}
        postCountsByCategory={postCountsByCategory}
        totalPostCount={posts.length}
        selectedCategorySlug={categorySlug ?? null}
      />
      <PostList posts={filteredPosts} title={title} />
    </div>
  )
}
