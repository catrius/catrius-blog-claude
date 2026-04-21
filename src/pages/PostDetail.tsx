import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { Link, useNavigate, useParams } from 'react-router';
import { useGetPostQuery, useGetRelatedPostsQuery, useDeletePostMutation, useRecordPostViewMutation } from '@/store/api';
import { SITE_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import CommentSection from '@/components/comments/CommentSection';
import LikeButton from '@/components/LikeButton';
import ReadingProgress from '@/components/ReadingProgress';
import ShareButtons from '@/components/ShareButtons';
import TableOfContents from '@/components/TableOfContents';
import TagPill from '@/components/TagPill';
import { extractHeadings } from '@/lib/extractHeadings';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: post, isLoading, error } = useGetPostQuery(slug!);
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: relatedPosts } = useGetRelatedPostsQuery(
    { postId: post?.id ?? 0, tags: post?.tags ?? [] },
    { skip: !post || post.tags.length === 0 },
  );
  const [recordView] = useRecordPostViewMutation();
  const viewRecorded = useRef(false);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (post && !viewRecorded.current) {
      viewRecorded.current = true;
      recordView(post.slug);
    }
  }, [post, recordView]);

  async function handleDelete() {
    if (!post) return;
    await deletePost(post.id);
    setShowDeleteDialog(false);
    navigate('/');
  }

  if (isLoading) {
    return (
      <article>
        {/* Cover image */}
        <div data-skeleton className="mb-6 aspect-3/1 w-full rounded-lg" />
        {/* Title */}
        <div data-skeleton className="mb-2 h-9 w-3/4" />
        {/* Meta (date, reading time, views) */}
        <div data-skeleton className="mb-6 h-4 w-64" />
        {/* Tags */}
        <div className="mb-6 flex gap-2">
          <div data-skeleton className="h-6 w-16 rounded-full" />
          <div data-skeleton className="h-6 w-20 rounded-full" />
          <div data-skeleton className="h-6 w-14 rounded-full" />
        </div>
        {/* Content paragraphs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-5/6" />
          </div>
          <div data-skeleton className="h-7 w-1/3" />
          <div className="space-y-2">
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-4/5" />
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-2/3" />
          </div>
          <div data-skeleton className="h-7 w-2/5" />
          <div className="space-y-2">
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-3/4" />
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-5/6" />
            <div data-skeleton className="h-4 w-full" />
            <div data-skeleton className="h-4 w-2/3" />
          </div>
        </div>
        {/* Share + like bar */}
        <div className="mt-8 flex items-center justify-between">
          <div data-skeleton className="h-9 w-28 rounded-full" />
          <div data-skeleton className="h-9 w-16 rounded-full" />
        </div>
      </article>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20 text-center">
        <title>{`Post Not Found | ${SITE_NAME}`}</title>
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
        <h1
          className="
            mb-2 font-heading text-2xl font-bold text-gray-900
            dark:text-slate-100
          "
        >
          Post not found
        </h1>
        <p
          className="
            mb-8 text-gray-500
            dark:text-slate-400
          "
        >
          This post may have been removed or the URL is incorrect.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="
              rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white
              no-underline transition-colors
              hover:bg-blue-600
            "
          >
            Go home
          </Link>
          <Link
            to="/search"
            className="
              rounded-full border border-gray-200 px-5 py-2 text-sm font-medium
              text-gray-700 no-underline transition-colors
              hover:border-gray-300 hover:bg-gray-50
              dark:border-slate-700 dark:text-slate-300
              dark:hover:border-slate-600 dark:hover:bg-slate-800
            "
          >
            Search posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article ref={articleRef}>
      <ReadingProgress targetRef={articleRef} />
      <title>{`${post.title} | ${SITE_NAME}`}</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:type" content="article" />
      {post.cover_image && <meta property="og:image" content={post.cover_image} />}
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt=""
          className="mb-6 aspect-3/1 w-full rounded-lg object-cover"
        />
      )}
      {isAdmin && (
        <div className="mb-4 flex gap-2">
          <Link
            to={`/admin/posts/${post.id}/edit`}
            className="
              rounded-sm bg-blue-50 px-3 py-1 text-sm text-blue-700 no-underline
              hover:bg-blue-100
              dark:bg-blue-900/30 dark:text-blue-300
              dark:hover:bg-blue-900/50
            "
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="
              cursor-pointer rounded-sm bg-red-50 px-3 py-1 text-sm text-red-700
              hover:bg-red-100
              dark:bg-red-900/30 dark:text-red-300
              dark:hover:bg-red-900/50
            "
          >
            Delete
          </button>
        </div>
      )}
      <h1 className="mb-2 font-heading text-3xl font-bold">{post.title}</h1>
      <div
        className="
          mb-6 flex items-center gap-2 text-sm text-gray-400
          dark:text-slate-500
        "
      >
        <time>{new Date(post.created_at).toLocaleDateString()}</time>
        {post.reading_time_minutes != null && (
          <>
            <span>&middot;</span>
            <span>{post.reading_time_minutes} min read</span>
          </>
        )}
        <span>&middot;</span>
        <span>{post.view_count} {post.view_count === 1 ? 'view' : 'views'}</span>
        <span>&middot;</span>
        <LikeButton postId={post.id} />
      </div>
      {post.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <TagPill key={tag} tag={tag} size="md" />
          ))}
        </div>
      )}
      <TableOfContents headings={extractHeadings(post.content)} />
      <div
        className="
          prose max-w-none
          dark:prose-invert
        "
      >
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeRaw]}>{post.content}</Markdown>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <ShareButtons url={`${window.location.origin}/posts/${post.slug}`} title={post.title} />
        <LikeButton postId={post.id} />
      </div>

      {relatedPosts && relatedPosts.length > 0 && (
        <section
          className="
            mt-12 border-t border-gray-200 pt-8
            dark:border-slate-700
          "
        >
          <h2 className="
            mb-4 flex items-center gap-2 font-heading text-xl font-bold
          ">
            <span className="
              inline-block h-5 w-1 rounded-full bg-linear-to-b from-blue-500
              via-purple-500 to-pink-500
            " />
            Related Posts
          </h2>
          <div
            className="
              grid gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                to={`/posts/${related.slug}`}
  
                className="
                  block rounded-lg p-4 no-underline shadow-md transition-all
                  duration-200
                  hover:-translate-y-0.5 hover:shadow-xl
                  dark:bg-slate-800/50 dark:shadow-slate-900/50
                  dark:hover:shadow-blue-500/10
                "
              >
                <h3
                  className="
                    mb-1 font-heading text-base font-semibold text-gray-900
                    dark:text-slate-100
                  "
                >
                  {related.title}
                </h3>
                <p
                  className="
                    line-clamp-2 text-sm text-gray-500
                    dark:text-slate-400
                  "
                >
                  {related.excerpt}
                </p>
                <time
                  className="
                    mt-2 block text-xs text-gray-400
                    dark:text-slate-500
                  "
                >
                  {new Date(related.created_at).toLocaleDateString()}
                </time>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CommentSection postId={post.id} />

      {isAdmin && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          itemTitle={post.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
    </article>
  );
}
