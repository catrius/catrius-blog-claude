import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'
import Sidebar from '../components/Sidebar'
import PostList from './PostList'

type Post = Tables<'post'>
type Category = Tables<'category'>

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [postsResult, categoriesResult] = await Promise.all([
        supabase.from('post').select('*').order('created_at', { ascending: false }),
        supabase.from('category').select('*').order('name'),
      ])

      if (postsResult.error) {
        setError(postsResult.error.message)
      } else {
        setPosts(postsResult.data)
      }

      if (categoriesResult.data) {
        setCategories(categoriesResult.data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <p>Loading posts...</p>
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
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
    <div className="flex gap-8">
      <Sidebar
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
