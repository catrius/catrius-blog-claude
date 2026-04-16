import type { Tables } from '../types/database'

type Category = Tables<'category'>

interface SidebarProps {
  categories: Category[]
  postCountsByCategory: Map<number, number>
  totalPostCount: number
  selectedCategoryId: number | null
  onSelectCategory: (id: number | null) => void
}

export default function Sidebar({
  categories,
  postCountsByCategory,
  totalPostCount,
  selectedCategoryId,
  onSelectCategory,
}: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Categories
      </h2>
      <ul className="flex flex-col gap-1">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              selectedCategoryId === null
                ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            All Posts
            <span className="ml-auto float-right text-gray-400 dark:text-gray-500">{totalPostCount}</span>
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selectedCategoryId === category.id
                  ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {category.name}
              <span className="ml-auto float-right text-gray-400 dark:text-gray-500">
                {postCountsByCategory.get(category.id) ?? 0}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
