import { useState } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Link, useNavigate, useParams } from 'react-router';
import { useGetPageQuery, useDeletePageMutation } from '@/store/api';
import { SITE_NAME } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: page, isLoading, error } = useGetPageQuery(slug!);
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDelete() {
    if (!page) return;
    await deletePage(page.id);
    setShowDeleteDialog(false);
    navigate('/');
  }

  if (isLoading) {
    return null;
  }

  if (error || !page) {
    return <p className="text-red-500">Page not found.</p>;
  }

  return (
    <article>
      <title>{`${page.title} | ${SITE_NAME}`}</title>
      <meta property="og:title" content={page.title} />
      {isAdmin && (
        <div className="mb-4 flex gap-2">
          <Link
            to={`/admin/pages/${page.id}/edit`}
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
      <h1 className="mb-6 text-3xl font-bold">{page.title}</h1>
      <div
        className="
        prose max-w-none
        dark:prose-invert
      "
      >
        <Markdown rehypePlugins={[rehypeRaw]}>{page.content}</Markdown>
      </div>

      {isAdmin && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          itemTitle={page.title}
          itemType="page"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
    </article>
  );
}
