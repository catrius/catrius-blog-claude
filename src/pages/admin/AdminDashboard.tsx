import { useState } from 'react'
import { Link } from 'react-router'
import {
  useGetAdminPostsQuery,
  useGetCategoriesQuery,
  useDeletePostMutation,
} from '../../store/api'
import DeleteConfirmDialog from '../../components/admin/DeleteConfirmDialog'

export default function AdminDashboard() {
  const { data: posts = [], isLoading } = useGetAdminPostsQuery()
  const { data: categories = [] } = useGetCategoriesQuery()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()
  const [deletingPost, setDeletingPost] = useState<{
    id: number
    title: string
  } | null>(null)

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  async function handleDelete() {
    if (!deletingPost) return
    await deletePost(deletingPost.id)
    setDeletingPost(null)
  }

  if (isLoading) return null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          to="/admin/posts/new"
          className="
            rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
            no-underline
            hover:bg-blue-700
            dark:bg-blue-500
            dark:hover:bg-blue-600
          "
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="
          text-gray-500
          dark:text-gray-400
        ">
          No posts yet. Create your first post!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="
                border-b border-gray-200
                dark:border-gray-800
              ">
                <th className="
                  pr-4 pb-3 font-medium text-gray-500
                  dark:text-gray-400
                ">
                  Title
                </th>
                <th className="
                  hidden pr-4 pb-3 font-medium text-gray-500
                  sm:table-cell
                  dark:text-gray-400
                ">
                  Category
                </th>
                <th className="
                  hidden pr-4 pb-3 font-medium text-gray-500
                  md:table-cell
                  dark:text-gray-400
                ">
                  Date
                </th>
                <th className="
                  pb-3 text-right font-medium text-gray-500
                  dark:text-gray-400
                ">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="
                    border-b border-gray-100
                    dark:border-gray-800/50
                  "
                >
                  <td className="py-3 pr-4">
                    <Link
                      to={`/posts/${post.slug}`}
                      className="
                        text-gray-900 no-underline
                        hover:text-blue-600
                        dark:text-white
                        dark:hover:text-blue-400
                      "
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="
                    hidden py-3 pr-4 text-gray-500
                    sm:table-cell
                    dark:text-gray-400
                  ">
                    {post.category_id
                      ? categoryMap.get(post.category_id) ?? '—'
                      : '—'}
                  </td>
                  <td className="
                    hidden py-3 pr-4 text-gray-500
                    md:table-cell
                    dark:text-gray-400
                  ">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="
                          rounded-sm px-2 py-1 text-xs text-blue-600
                          no-underline
                          hover:bg-blue-50
                          dark:text-blue-400
                          dark:hover:bg-blue-900/30
                        "
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          setDeletingPost({ id: post.id, title: post.title })
                        }
                        className="
                          rounded-sm px-2 py-1 text-xs text-red-600
                          hover:bg-red-50
                          dark:text-red-400
                          dark:hover:bg-red-900/30
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deletingPost}
        postTitle={deletingPost?.title ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPost(null)}
        isDeleting={isDeleting}
      />
    </div>
  )
}
