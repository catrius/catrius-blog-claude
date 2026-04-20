import { useGetCommentsQuery } from '@/store/api'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentSectionProps {
  postId: number
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments, isLoading, error } = useGetCommentsQuery(postId)

  return (
    <section className="
      mt-12 border-t border-gray-200 pt-8
      dark:border-gray-700
    ">
      <h2 className="mb-4 text-xl font-bold">
        Comments{comments && comments.length > 0 ? ` (${comments.length})` : ''}
      </h2>

      {isLoading && (
        <p className="
          text-sm text-gray-400
          dark:text-gray-500
        ">
          Loading comments...
        </p>
      )}

      {error != null && (
        <p className="text-sm text-red-500">Failed to load comments.</p>
      )}

      {comments && comments.length === 0 && (
        <p className="
          text-sm text-gray-500
          dark:text-gray-400
        ">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      {comments && comments.length > 0 && (
        <div className="mb-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}

      <CommentForm postId={postId} />
    </section>
  )
}
