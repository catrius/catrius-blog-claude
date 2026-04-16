import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type Post = Tables<'post'>

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setPosts(data)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <p>Loading posts...</p>
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-gray-200 p-6 hover:border-blue-500 transition-colors dark:border-gray-700"
            >
              <Link to={`/posts/${post.id}`} className="block no-underline text-inherit">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-500 mb-3 dark:text-gray-400">{post.excerpt}</p>
                <time className="text-sm text-gray-400 dark:text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
