import { useEffect, useState, type FormEvent } from 'react'
import { createComment, errorMessage, listComments } from '../api'
import type { Comment } from '../types'
import CommentItem from './CommentItem'

type CommentSectionProps = {
  articleId: number
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    listComments(articleId, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setComments(next)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(errorMessage(error))
        setLoading(false)
      })
    return () => controller.abort()
  }, [articleId])

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!body.trim()) {
      setFormError('Comment cannot be empty.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const created = await createComment(articleId, body.trim())
      setComments((current) => [...current, created])
      setBody('')
    } catch (error) {
      setFormError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  function handleUpdated(updated: Comment) {
    setComments((current) =>
      current.map((comment) =>
        comment.commentId === updated.commentId ? updated : comment,
      ),
    )
  }

  function handleDeleted(commentId: number) {
    setComments((current) =>
      current.filter((comment) => comment.commentId !== commentId),
    )
  }

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <div className="section-heading">
        <h2 id="comments-heading">Comments</h2>
        {!loading && !loadError && (
          <p className="count">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </p>
        )}
      </div>

      {loading && <p className="status">Loading comments…</p>}
      {loadError && (
        <p className="banner error" role="alert">
          {loadError}
        </p>
      )}
      {!loading && !loadError && comments.length === 0 && (
        <p className="status">No comments yet.</p>
      )}
      {!loading && !loadError && comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              articleId={articleId}
              comment={comment}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </ul>
      )}

      <form className="comment-form" onSubmit={handleAdd} noValidate>
        <div className="field">
          <label htmlFor="new-comment">Add a comment</label>
          <textarea
            id="new-comment"
            rows={4}
            value={body}
            placeholder="Write a comment"
            onChange={(event) => setBody(event.target.value)}
            aria-invalid={formError ? true : undefined}
          />
          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
        </div>
        <div className="button-row">
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  )
}
