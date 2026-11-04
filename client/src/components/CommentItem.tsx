import { useState, type FormEvent } from 'react'
import { deleteComment, errorMessage, updateComment } from '../api'
import type { Comment } from '../types'

type CommentItemProps = {
  articleId: number
  comment: Comment
  onUpdated: (comment: Comment) => void
  onDeleted: (commentId: number) => void
}

export default function CommentItem({
  articleId,
  comment,
  onUpdated,
  onDeleted,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.body)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function cancelEdit() {
    setDraft(comment.body)
    setError(null)
    setEditing(false)
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) {
      setError('Comment cannot be empty.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateComment(articleId, comment.commentId, draft.trim())
      onUpdated(updated)
      setDraft(updated.body)
      setEditing(false)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setDeleting(true)
    setError(null)
    try {
      await deleteComment(articleId, comment.commentId)
      onDeleted(comment.commentId)
    } catch (err) {
      setError(errorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <li className="comment">
      {editing ? (
        <form onSubmit={saveEdit} noValidate>
          <div className="field">
            <label htmlFor={`edit-comment-${comment.commentId}`}>Edit comment</label>
            <textarea
              id={`edit-comment-${comment.commentId}`}
              rows={4}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-invalid={error ? true : undefined}
            />
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="button-row">
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="button"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="comment-body">{comment.body}</p>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="button-row">
            <button type="button" className="button" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              className="button danger"
              onClick={remove}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </li>
  )
}
