import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
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
        col-span-full flex flex-col overflow-hidden rounded-lg border
        border-gray-200 transition-all duration-200
        hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg
        sm:flex-row
        dark:border-slate-700
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
        flex flex-col overflow-hidden rounded-lg border border-gray-200
        transition-all duration-200
        hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg
        dark:border-slate-700
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
      <h1 className="mb-6 font-heading text-3xl font-bold">{title}</h1>
      {posts.length === 0 && !isFetching ? (
        <p>No posts yet.</p>
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
