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
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const filteredPages = pages.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()))
      return false
    if (dateFilter) {
      const created = new Date(p.created_at)
      const now = new Date()
      const daysAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      if (dateFilter === '7' && daysAgo > 7) return false
      if (dateFilter === '30' && daysAgo > 30) return false
      if (dateFilter === '90' && daysAgo > 90) return false
      if (dateFilter === 'year' && created.getFullYear() !== now.getFullYear())
        return false
    }
    return true
  })

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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="pr-4 pb-2">
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="
                    w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm
                    font-normal
                    placeholder:text-gray-400
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    focus:outline-none
                    dark:border-gray-700 dark:bg-gray-900 dark:text-white
                    dark:placeholder:text-gray-500
                    dark:focus:border-blue-400 dark:focus:ring-blue-400
                  "
                />
              </th>
              <th className="
                hidden pr-4 pb-2
                md:table-cell
              ">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="
                    w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm
                    font-normal
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    focus:outline-none
                    dark:border-gray-700 dark:bg-gray-900 dark:text-white
                    dark:focus:border-blue-400 dark:focus:ring-blue-400
                  "
                >
                  <option value="">All time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="year">This year</option>
                </select>
              </th>
              <th className="pb-2" />
            </tr>
            <tr className="
              border-b border-gray-200
              dark:border-gray-800
            ">
              <th className="
                pt-2 pr-4 pb-3 font-medium text-gray-500
                dark:text-gray-400
              ">
                Title
              </th>
              <th className="
                hidden pt-2 pr-4 pb-3 font-medium text-gray-500
                md:table-cell
                dark:text-gray-400
              ">
                Date
              </th>
              <th className="
                pt-2 pb-3 text-right font-medium text-gray-500
                dark:text-gray-400
              ">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan={3} className="
                  py-6 text-center text-gray-500
                  dark:text-gray-400
                ">
                  {search || dateFilter
                    ? 'No pages match your filters.'
                    : 'No pages yet. Create your first page!'}
                </td>
              </tr>
            ) : (
              filteredPages.map((page) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

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
