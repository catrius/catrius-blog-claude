import type { Tables } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteCommentMutation } from '@/store/api';

interface CommentItemProps {
  comment: Tables<'comment'>;
  postId: number;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  const { user, isAdmin } = useAuth();
  const [deleteComment, { isLoading }] = useDeleteCommentMutation();

  const canDelete = isAdmin || user?.id === comment.user_id;

  return (
    <div
      className="
        border-b border-gray-200 py-4
        last:border-b-0
        dark:border-slate-700
      "
    >
      <div className="mb-2 flex items-center gap-3">
        {comment.user_avatar ? (
          <img
            src={comment.user_avatar}
            alt={comment.user_name}
            referrerPolicy="no-referrer"
            className="size-8 shrink-0 rounded-full"
          />
        ) : (
          <div
            className="
              flex size-8 shrink-0 items-center justify-center rounded-full
              bg-gray-200 text-sm font-medium text-gray-600
              dark:bg-slate-700 dark:text-slate-300
            "
          >
            {comment.user_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-1 items-center gap-2">
          <span
            className="
              text-sm font-medium text-gray-900
              dark:text-slate-100
            "
          >
            {comment.user_name}
          </span>
          <time
            className="
              text-xs text-gray-400
              dark:text-slate-500
            "
          >
            {new Date(comment.created_at).toLocaleDateString()}
          </time>
        </div>
        {canDelete && (
          <button
            onClick={() => deleteComment({ id: comment.id, postId })}
            disabled={isLoading}
            className="
              cursor-pointer rounded-sm px-2 py-1 text-xs text-red-600
              hover:bg-red-50
              disabled:cursor-not-allowed disabled:opacity-50
              dark:text-red-400
              dark:hover:bg-red-900/30
            "
          >
            Delete
          </button>
        )}
      </div>
      <p
        className="
          text-sm whitespace-pre-wrap text-gray-700
          dark:text-slate-300
        "
      >
        {comment.body}
      </p>
    </div>
  );
}
