import { useState } from 'react'
import { Link } from 'react-router'
import { useGetAdminPagesQuery, useDeletePageMutation } from '@/store/api'
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog'

export default function AdminPages() {
  const { data: pages = [], isLoading } = useGetAdminPagesQuery()
  const [deletePage, { isLoading: isDeletingPage }] = useDeletePageMutation()
  const [deletingPage, setDeletingPage] = useState<{
    id: number
    title: string
  } | null>(null)

  async function handleDeletePage() {
    if (!deletingPage) return
    await deletePage(deletingPage.id)
    setDeletingPage(null)
  }

  if (isLoading) return null

  return (
    <div className="mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link
          to="/admin/pages/new"
          className="
            rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
            no-underline
            hover:bg-blue-700
            dark:bg-blue-500
            dark:hover:bg-blue-600
          "
        >
          New Page
        </Link>
      </div>

      {pages.length === 0 ? (
        <p className="
          text-gray-500
          dark:text-gray-400
        ">
          No pages yet. Create your first page!
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
              {pages.map((page) => (
                <tr
                  key={page.id}
                  className="
                    border-b border-gray-100
                    dark:border-gray-800/50
                  "
                >
                  <td className="py-3 pr-4">
                    <Link
                      to={`/admin/pages/${page.id}/edit`}
                      className="
                        text-gray-900 no-underline
                        hover:text-blue-600
                        dark:text-white
                        dark:hover:text-blue-400
                      "
                    >
                      {page.title}
                    </Link>
                  </td>
                  <td className="
                    hidden py-3 pr-4 text-gray-500
                    md:table-cell
                    dark:text-gray-400
                  ">
                    {new Date(page.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/pages/${page.slug}`}
                        className="
                          rounded-sm px-2 py-1 text-xs text-blue-600
                          no-underline
                          hover:bg-blue-50
                          dark:text-blue-400
                          dark:hover:bg-blue-900/30
                        "
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() =>
                          setDeletingPage({ id: page.id, title: page.title })
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
        open={!!deletingPage}
        itemTitle={deletingPage?.title ?? ''}
        itemType="page"
        onConfirm={handleDeletePage}
        onCancel={() => setDeletingPage(null)}
        isDeleting={isDeletingPage}
      />
    </div>
  )
}
