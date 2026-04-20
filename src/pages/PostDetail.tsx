import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Link, useNavigate, useParams } from 'react-router';
import { useGetPostQuery, useGetRelatedPostsQuery, useDeletePostMutation, useRecordPostViewMutation } from '@/store/api';
import { SITE_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import CommentSection from '@/components/comments/CommentSection';
import LikeButton from '@/components/LikeButton';
import ReadingProgress from '@/components/ReadingProgress';

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
    return null;
  }

  if (error || !post) {
    return <p className="text-red-500">Post not found.</p>;
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
            <Link
              key={tag}
              to={`/tags/${encodeURIComponent(tag)}`}

              className="
                rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-600
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
      <div
        className="
          prose max-w-none
          dark:prose-invert
        "
      >
        <Markdown rehypePlugins={[rehypeRaw]}>{post.content}</Markdown>
      </div>

      <div className="mt-8 flex justify-end">
        <LikeButton postId={post.id} />
      </div>

      {relatedPosts && relatedPosts.length > 0 && (
        <section
          className="
            mt-12 border-t border-gray-200 pt-8
            dark:border-slate-700
          "
        >
          <h2 className="mb-4 font-heading text-xl font-bold">Related Posts</h2>
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
                  block rounded-lg border border-gray-200 p-4 no-underline
                  transition-colors
                  hover:border-blue-300 hover:bg-blue-50/50
                  dark:border-slate-700
                  dark:hover:border-blue-700 dark:hover:bg-blue-900/20
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
