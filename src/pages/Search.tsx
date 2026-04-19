import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { useSearchPostsQuery, PAGE_SIZE } from '@/store/api'
import { SITE_NAME } from '@/constants'
import PostList from '@/pages/PostList'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(query)
  const [offset, setOffset] = useState(0)
  const [prevQuery, setPrevQuery] = useState(query)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  if (query !== prevQuery) {
    setPrevQuery(query)
    setOffset(0)
  }

  // Sync input when URL changes externally (e.g. back/forward)
  useEffect(() => {
    setInputValue(query)
  }, [query])

  function handleInputChange(value: string) {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        setSearchParams({ q: value.trim() }, { replace: true })
      } else {
        setSearchParams({}, { replace: true })
      }
    }, 1000)
  }

  const {
    data,
    isFetching,
    error,
  } = useSearchPostsQuery(
    { query, offset, limit: PAGE_SIZE },
    { skip: !query },
  )

  const handleLoadMore = () => {
    if (data && !isFetching && data.hasMore) {
      setOffset(data.posts.length)
    }
  }

  return (
    <div>
      <title>{query ? `Search: ${query} | ${SITE_NAME}` : `Search | ${SITE_NAME}`}</title>
      <div className="mb-8">
        <div className="relative">
          <svg
            className="
              absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400
              dark:text-gray-500
            "
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="search"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search posts..."
            autoFocus
            className="
              w-full rounded-lg border border-gray-200 bg-white py-3 pr-4 pl-10
              text-gray-900 placeholder-gray-400 transition-colors outline-none
              focus:border-blue-500
              dark:border-gray-700 dark:bg-gray-900 dark:text-white
              dark:placeholder-gray-500
              dark:focus:border-blue-500
            "
          />
        </div>
      </div>

      {error ? (
        <p className="text-red-500">Error searching posts.</p>
      ) : !query ? (
        <p className="
          text-gray-500
          dark:text-gray-400
        ">
          Enter a search term to find posts.
        </p>
      ) : (
        <PostList
          posts={data?.posts ?? []}
          title={`Results for "${query}"`}
          hasMore={data?.hasMore ?? false}
          isFetching={isFetching}
          onLoadMore={handleLoadMore}
          highlightQuery={query}
        />
      )}
    </div>
  )
}
