import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateCommentMutation } from '@/store/api';

interface CommentFormProps {
  postId: number;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const { user, signInWithGoogle } = useAuth();
  const [body, setBody] = useState('');
  const [createComment, { isLoading }] = useCreateCommentMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !body.trim()) return;

    await createComment({
      post_id: postId,
      user_id: user.id,
      user_name: user.user_metadata.full_name ?? user.email ?? 'Anonymous',
      user_avatar: user.user_metadata.avatar_url ?? null,
      body: body.trim(),
    });
    setBody('');
  }

  if (!user) {
    return (
      <div
        className="
          rounded-lg border border-gray-200 p-4 text-center
          dark:border-slate-700
        "
      >
        <p
          className="
            mb-3 text-sm text-gray-600
            dark:text-slate-400
          "
        >
          Sign in to leave a comment.
        </p>
        <button
          onClick={signInWithGoogle}
          className="
            cursor-pointer rounded-sm bg-blue-50 px-4 py-2 text-sm font-medium
            text-blue-700
            hover:bg-blue-100
            dark:bg-blue-900/30 dark:text-blue-300
            dark:hover:bg-blue-900/50
          "
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        {user.user_metadata.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name ?? ''}
            referrerPolicy="no-referrer"
            className="size-6 rounded-full"
          />
        ) : (
          <div
            className="
              flex size-6 items-center justify-center rounded-full bg-gray-200
              text-xs font-medium text-gray-600
              dark:bg-slate-700 dark:text-slate-300
            "
          >
            {(user.user_metadata.full_name ?? user.email ?? '?').charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className="
            text-sm font-medium text-gray-700
            dark:text-slate-300
          "
        >
          {user.user_metadata.full_name ?? user.email}
        </span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="Write a comment..."
        maxLength={2000}
        rows={3}
        className="
          w-full resize-y rounded-lg border border-gray-200 bg-white p-3 text-sm
          text-gray-900
          placeholder:text-gray-400
          focus:border-blue-300 focus:ring-1 focus:ring-blue-300
          focus:outline-none
          dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100
          dark:placeholder:text-slate-500
          dark:focus:border-blue-600 dark:focus:ring-blue-600
        "
      />
      <div className="mt-2 flex items-center justify-between">
        <span
          className="
            text-xs text-gray-400
            dark:text-slate-500
          "
        >
          {body.length}/2000
        </span>
        <button
          type="submit"
          disabled={!body.trim() || isLoading}
          className="
            cursor-pointer rounded-sm bg-blue-50 px-4 py-1.5 text-sm font-medium
            text-blue-700
            hover:bg-blue-100
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-blue-900/30 dark:text-blue-300
            dark:hover:bg-blue-900/50
          "
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
