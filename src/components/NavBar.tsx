import { Link } from 'react-router'
import type { Tables } from '../types/database'

type Category = Tables<'category'>

interface NavBarProps {
  categories: Category[]
  postCountsByCategory: Map<number, number>
  totalPostCount: number
  selectedCategorySlug: string | null
}

export default function NavBar({
  categories,
  postCountsByCategory,
  totalPostCount,
  selectedCategorySlug,
}: NavBarProps) {
  return (
    <nav className="mb-6 overflow-x-auto">
      <ul className="flex gap-2">
        <li>
          <Link
            to="/"
            className={`inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm no-underline transition-colors ${
              selectedCategorySlug === null
                ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            All Posts
            <span className="ml-1.5 text-gray-400 dark:text-gray-500">({totalPostCount})</span>
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/categories/${category.slug}`}
              className={`inline-block whitespace-nowrap rounded-full px-4 py-1.5 text-sm no-underline transition-colors ${
                selectedCategorySlug === category.slug
                  ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {category.name}
              <span className="ml-1.5 text-gray-400 dark:text-gray-500">
                ({postCountsByCategory.get(category.id) ?? 0})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
