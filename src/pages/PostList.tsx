import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Tables } from '@/types/database';
import LikeButton from '@/components/LikeButton';

type Post = Tables<'post'>;

interface PostListProps {
  posts: Post[];
  title: string;
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}

function PostMeta({ post }: { post: Post }) {
  return (
    <div
      className="
        mb-3 flex items-center gap-2 text-sm text-gray-400
        dark:text-slate-500
      "
    >
      <time>
        {new Date(post.created_at).toLocaleString(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </time>
      {post.reading_time_minutes != null && (
        <>
          <span>&middot;</span>
          <span>{post.reading_time_minutes} min read</span>
        </>
      )}
    </div>
  );
}

function PostTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Link
          key={tag}
          to={`/tags/${encodeURIComponent(tag)}`}

          className="
            rounded-full bg-linear-to-r from-gray-100 to-gray-50 px-2.5 py-0.5
            text-xs text-gray-600 no-underline transition-colors
            hover:from-blue-100 hover:to-blue-50 hover:text-blue-600
            dark:from-slate-800 dark:to-slate-700 dark:text-slate-400
            dark:hover:from-blue-900/30 dark:hover:to-blue-800/20
            dark:hover:text-blue-400
          "
        >
          <span className="
            mr-0.5 text-gray-400
            dark:text-slate-500
          ">#</span>{tag}
        </Link>
      ))}
    </div>
  );
}

function PostStats({ post }: { post: Post }) {
  return (
    <div className="mt-auto flex items-center justify-end gap-3 pt-4">
      <span className="
        text-sm text-gray-400
        dark:text-slate-500
      ">
        {post.view_count} {post.view_count === 1 ? 'view' : 'views'}
      </span>
      <LikeButton postId={post.id} />
    </div>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <li
      className="
        col-span-full flex flex-col overflow-hidden rounded-lg shadow-md
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl
        sm:flex-row
        dark:bg-slate-800/50 dark:shadow-slate-900/50
        dark:hover:shadow-blue-500/10
      "
    >
      {post.cover_image && (
        <Link to={`/posts/${post.slug}`} className="
          block
          sm:w-1/2
        ">
          <img
            src={post.cover_image}
            alt=""
            className="
              aspect-2/1 w-full object-cover
              sm:h-full
            "
          />
        </Link>
      )}
      <div
        className={`
          flex flex-1 flex-col p-6
          ${post.cover_image ? 'sm:w-1/2' : ''}
        `}
      >
        <Link to={`/posts/${post.slug}`} className="
          block text-inherit no-underline
        ">
          <h2 className="mb-2 font-heading text-2xl font-semibold">{post.title}</h2>
          <PostMeta post={post} />
          <p className="
            text-gray-500
            dark:text-slate-400
          ">{post.excerpt}</p>
        </Link>
        <PostTags tags={post.tags} />
        <PostStats post={post} />
      </div>
    </li>
  );
}

function RegularCard({ post }: { post: Post }) {
  return (
    <li
      className="
        flex flex-col overflow-hidden rounded-lg shadow-md transition-all
        duration-200
        hover:-translate-y-1 hover:shadow-xl
        dark:bg-slate-800/50 dark:shadow-slate-900/50
        dark:hover:shadow-blue-500/10
      "
    >
      {post.cover_image && (
        <Link to={`/posts/${post.slug}`} className="block">
          <img
            src={post.cover_image}
            alt=""
            className="aspect-2/1 w-full object-cover"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-6">
        <Link to={`/posts/${post.slug}`} className="
          block text-inherit no-underline
        ">
          <h2 className="mb-2 font-heading text-xl font-semibold">{post.title}</h2>
          <PostMeta post={post} />
          <p className="
            text-gray-500
            dark:text-slate-400
          ">{post.excerpt}</p>
        </Link>
        <PostTags tags={post.tags} />
        <PostStats post={post} />
      </div>
    </li>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="py-16 text-center">
      <svg
        className="
          mx-auto mb-4 size-16 text-gray-300
          dark:text-slate-600
        "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
      <p className="
        mb-2 text-lg font-medium text-gray-500
        dark:text-slate-400
      ">No posts yet</p>
      <p className="
        mb-6 text-sm text-gray-400
        dark:text-slate-500
      ">Check back soon for new content.</p>
      <button
        onClick={() => navigate('/')}
        className="
          cursor-pointer rounded-full bg-blue-500 px-5 py-2 text-sm font-medium
          text-white transition-colors
          hover:bg-blue-600
        "
      >
        Browse all posts
      </button>
    </div>
  );
}

export default function PostList({ posts, title, hasMore, isFetching, onLoadMore }: PostListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetching, onLoadMore]);

  const [featured, ...rest] = posts;

  return (
    <div className="min-w-0 flex-1">
      <h1 className="
        mb-6 flex items-center gap-3 font-heading text-3xl font-bold
      ">
        <span className="
          inline-block h-8 w-1 rounded-full bg-linear-to-b from-blue-500
          via-purple-500 to-pink-500
        " />
        {title}
      </h1>
      {posts.length === 0 && !isFetching ? (
        <EmptyState />
      ) : (
        <>
          <ul
            className="
              grid grid-cols-1 gap-6
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {featured && <FeaturedCard post={featured} />}
            {rest.map((post) => (
              <RegularCard key={post.id} post={post} />
            ))}
          </ul>
          <div ref={sentinelRef} className="h-1" />
        </>
      )}
    </div>
  );
}
