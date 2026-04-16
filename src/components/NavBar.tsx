import type { Tables } from '../types/database'

type Category = Tables<'category'>

interface NavBarProps {
  categories: Category[]
  postCountsByCategory: Map<number, number>
  totalPostCount: number
  selectedCategoryId: number | null
  onSelectCategory: (id: number | null) => void
}

export default function NavBar({
  categories,
  postCountsByCategory,
  totalPostCount,
  selectedCategoryId,
  onSelectCategory,
}: NavBarProps) {
  return (
    <nav className="mb-6 overflow-x-auto">
      <ul className="flex gap-2">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
              selectedCategoryId === null
                ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            All Posts
            <span className="ml-1.5 text-gray-400 dark:text-gray-500">({totalPostCount})</span>
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                selectedCategoryId === category.id
                  ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {category.name}
              <span className="ml-1.5 text-gray-400 dark:text-gray-500">
                ({postCountsByCategory.get(category.id) ?? 0})
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
