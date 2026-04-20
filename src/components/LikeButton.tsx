import { useAuth } from '@/hooks/useAuth';
import { useGetLikeStatusQuery, useToggleLikeMutation } from '@/store/api';

interface LikeButtonProps {
  postId: number;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const { user, signInWithGoogle } = useAuth();
  const { data: likeStatus } = useGetLikeStatusQuery({
    postId,
    userId: user?.id ?? null,
  });
  const [toggleLike, { isLoading }] = useToggleLikeMutation();

  async function handleClick() {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (!likeStatus || isLoading) return;
    await toggleLike({
      postId,
      userId: user.id,
      liked: likeStatus.likedByUser,
    });
  }

  const count = likeStatus?.count ?? 0;
  const liked = likeStatus?.likedByUser ?? false;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      className={`
        inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3
        py-1.5 text-sm transition-colors
        ${
          liked
            ? `
              border-red-200 bg-red-50 text-red-600
              hover:bg-red-100
              dark:border-red-800 dark:bg-red-950/50 dark:text-red-400
              dark:hover:bg-red-950
            `
            : `
              border-gray-200 bg-white text-gray-500
              hover:border-red-200 hover:bg-red-50 hover:text-red-500
              dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400
              dark:hover:border-red-800 dark:hover:bg-red-950/50
              dark:hover:text-red-400
            `
        }
      `}
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
