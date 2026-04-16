import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type Post = Tables<'post'>

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (error) {
        setError(error.message)
      } else {
        setPost(data)
      }
      setLoading(false)
    }

    fetchPost()
  }, [id])

  if (loading) {
    return <p>Loading post...</p>
  }

  if (error || !post) {
    return (
      <>
        <p className="text-red-500">{error ?? 'Post not found.'}</p>
        <Link to="/" className="text-blue-500 hover:underline">&larr; Back to posts</Link>
      </>
    )
  }

  return (
    <article>
      <Link to="/" className="inline-block mb-6 text-blue-500 hover:underline">
        &larr; Back to posts
      </Link>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <time className="block text-sm text-gray-400 mb-6 dark:text-gray-500">
        {new Date(post.created_at).toLocaleDateString()}
      </time>
      <div className="prose dark:prose-invert max-w-none">
        <Markdown>{post.content}</Markdown>
      </div>
    </article>
  )
}
