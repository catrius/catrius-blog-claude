import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useSearchPostsQuery, useGetCategoriesQuery, PAGE_SIZE } from '@/store/api';
import { SITE_NAME } from '@/constants';
import type { Tables } from '@/types/database';

type Post = Tables<'post'>;

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links → text
    .replace(/#{1,6}\s+/g, '') // headings
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2') // bold/italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // inline/block code
    .replace(/^[>\-*+]\s+/gm, '') // blockquotes, lists
    .replace(/\n{2,}/g, ' ') // collapse newlines
    .replace(/\n/g, ' ')
    .trim();
}

function getSnippet(content: string, query: string, maxLen = 200): string {
  const plain = stripMarkdown(content);
  const words = query.split(/\s+/).filter(Boolean);
  const pattern = new RegExp(words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  const match = pattern.exec(plain);
  if (!match) return plain.slice(0, maxLen) + (plain.length > maxLen ? '...' : '');

  const center = match.index + Math.floor(match[0].length / 2);
  const half = Math.floor(maxLen / 2);
  let start = Math.max(0, center - half);
  let end = Math.min(plain.length, center + half);

  // Snap to word boundaries
  if (start > 0) {
    const spaceAfter = plain.indexOf(' ', start);
    if (spaceAfter !== -1 && spaceAfter < start + 20) start = spaceAfter + 1;
  }
  if (end < plain.length) {
    const spaceBefore = plain.lastIndexOf(' ', end);
    if (spaceBefore > end - 20) end = spaceBefore;
  }

  const prefix = start > 0 ? '...' : '';
  const suffix = end < plain.length ? '...' : '';
  return prefix + plain.slice(start, end) + suffix;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part) ? (
          <mark
            key={i}
            className="
              rounded-sm bg-yellow-200/70 text-inherit
              dark:bg-yellow-500/30
            "
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function SearchResult({ post, query, categoryName }: { post: Post; query: string; categoryName: string | null }) {
  const snippet = getSnippet(post.content, query);
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <li
      className="
        rounded-lg border border-gray-200 p-5 transition-colors
        hover:border-blue-500
        dark:border-slate-700
      "
    >
      <Link
        to={`/posts/${post.slug}`}
        className="block text-inherit no-underline"
      >
        <h2 className="font-heading text-lg font-semibold">
          <Highlight text={post.title} query={query} />
        </h2>
        <div
          className="
            mt-1 flex items-center gap-2 text-sm text-gray-400
            dark:text-slate-500
          "
        >
          <time>{date}</time>
          {post.reading_time_minutes != null && (
            <>
              <span>&middot;</span>
              <span>{post.reading_time_minutes} min read</span>
            </>
          )}
          {categoryName && (
            <>
              <span>&middot;</span>
              <span>{categoryName}</span>
            </>
          )}
        </div>
        <p
          className="
            mt-2 text-sm/relaxed text-gray-500
            dark:text-slate-400
          "
        >
          <Highlight text={snippet} query={query} />
        </p>
      </Link>
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}
              className="
                rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600
                no-underline transition-colors
                hover:bg-blue-100 hover:text-blue-600
                dark:bg-slate-800 dark:text-slate-400
                dark:hover:bg-blue-900/30 dark:hover:text-blue-400
              "
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(query);
  const [offset, setOffset] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setOffset(0);
  }

  // Sync input when URL changes externally (e.g. back/forward)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  function handleInputChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        setSearchParams({ q: value.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 1000);
  }

  const { data: categories = [] } = useGetCategoriesQuery();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const { data, isFetching, error } = useSearchPostsQuery({ query, offset, limit: PAGE_SIZE }, { skip: !query });

  const hasMore = data?.hasMore ?? false;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching && data) {
          setOffset(data.posts.length);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetching, data]);

  const posts = data?.posts ?? [];

  return (
    <div>
      <title>{query ? `Search: ${query} | ${SITE_NAME}` : `Search | ${SITE_NAME}`}</title>
      <div className="mb-8">
        <div className="relative">
          <svg
            className="
              absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400
              dark:text-slate-500
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
              dark:border-slate-700 dark:bg-slate-800 dark:text-white
              dark:placeholder-slate-500
              dark:focus:border-blue-500
            "
          />
        </div>
      </div>

      {error ? (
        <p className="text-red-500">Error searching posts.</p>
      ) : !query ? (
        <p
          className="
            text-gray-500
            dark:text-slate-400
          "
        >
          Enter a search term to find posts.
        </p>
      ) : posts.length === 0 && !isFetching ? (
        <p
          className="
            text-gray-500
            dark:text-slate-400
          "
        >
          No results for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <>
          <p
            className="
              mb-6 text-sm text-gray-500
              dark:text-slate-400
            "
          >
            {posts.length}
            {hasMore ? '+' : ''} results for &ldquo;{query}&rdquo;
          </p>
          <ul className="space-y-6">
            {posts.map((post) => (
              <SearchResult
                key={post.id}
                post={post}
                query={query}
                categoryName={post.category_id ? (categoryMap.get(post.category_id) ?? null) : null}
              />
            ))}
          </ul>
          <div ref={sentinelRef} className="h-1" />
          {isFetching && (
            <p
              className="
                mt-4 text-center text-sm text-gray-400
                dark:text-slate-500
              "
            >
              Loading...
            </p>
          )}
        </>
      )}
    </div>
  );
}
