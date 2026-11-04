import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createComment,
  deleteComment,
  errorMessage,
  isAbortError,
  listComments,
  updateComment,
} from '../api.ts'
import type { Comment } from '../types.ts'

type CommentSectionProps = {
  articleId: number
}

type CommentSnapshot = {
  articleId: number
  reloadKey: number
  comments: Comment[]
  error: string
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const [snapshot, setSnapshot] = useState<CommentSnapshot | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestedId = articleId
    const requestedKey = reloadKey

    listComments(requestedId, controller.signal)
      .then((comments) => {
        if (controller.signal.aborted) return
        setSnapshot({
          articleId: requestedId,
          reloadKey: requestedKey,
          comments,
          error: '',
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return
        setSnapshot({
          articleId: requestedId,
          reloadKey: requestedKey,
          comments: [],
          error: errorMessage(err, 'Could not load comments'),
        })
      })

    return () => controller.abort()
  }, [articleId, reloadKey])

  const settled =
    snapshot !== null &&
    snapshot.articleId === articleId &&
    snapshot.reloadKey === reloadKey
  const comments = settled && !snapshot.error ? snapshot.comments : null
  const error = settled ? snapshot.error : ''

  function updateComments(transform: (comments: Comment[]) => Comment[]) {
    setSnapshot((current) => {
      if (!current || current.articleId !== articleId || current.error) return current
      return { ...current, comments: transform(current.comments) }
    })
  }

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <div className="comments-heading">
        <h2 id="comments-heading">Comments</h2>
        {comments ? <span className="count">{comments.length}</span> : null}
      </div>

      {comments === null && !error ? (
        <p className="status" role="status">
          Loading comments…
        </p>
      ) : null}

      {error ? (
        <div className="status-block status-error" role="alert">
          <h3>Could not load comments</h3>
          <p>{error}</p>
          <div className="status-action">
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {comments && comments.length === 0 ? (
        <p className="status" role="status">
          No comments yet.
        </p>
      ) : null}

      {comments && comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              articleId={articleId}
              comment={comment}
              onUpdated={(updated) => {
                updateComments((current) =>
                  current.map((item) =>
                    item.commentId === updated.commentId ? updated : item,
                  ),
                )
              }}
              onDeleted={(commentId) => {
                updateComments((current) =>
                  current.filter((item) => item.commentId !== commentId),
                )
              }}
            />
          ))}
        </ul>
      ) : null}

      {comments ? (
        <AddCommentForm
          articleId={articleId}
          onCreated={(comment) => {
            updateComments((current) => [...current, comment])
          }}
        />
      ) : null}
    </section>
  )
}

function CommentItem({
  articleId,
  comment,
  onUpdated,
  onDeleted,
}: {
  articleId: number
  comment: Comment
  onUpdated: (comment: Comment) => void
  onDeleted: (commentId: number) => void
}) {
  const fieldId = useId()
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(comment.body)
  const [validation, setValidation] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function startEditing() {
    setBody(comment.body)
    setValidation('')
    setError('')
    setEditing(true)
  }

  function cancelEditing() {
    setBody(comment.body)
    setValidation('')
    setError('')
    setEditing(false)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextBody = body.trim()
    if (!nextBody) {
      setValidation('Comment body is required.')
      return
    }

    setValidation('')
    setError('')
    setSaving(true)
    try {
      const updated = await updateComment(articleId, comment.commentId, nextBody)
      onUpdated(updated)
      setEditing(false)
    } catch (err) {
      setError(errorMessage(err, 'Could not update the comment'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setError('')
    setDeleting(true)
    try {
      await deleteComment(articleId, comment.commentId)
      onDeleted(comment.commentId)
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the comment'))
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <li className="comment">
        <form className="stack-form" onSubmit={handleSave} noValidate>
          <div className="field">
            <label htmlFor={fieldId}>Edit comment</label>
            <textarea
              id={fieldId}
              rows={4}
              value={body}
              autoFocus
              aria-invalid={Boolean(validation)}
              onChange={(event) => {
                setBody(event.target.value)
                if (validation) setValidation('')
              }}
            />
          </div>
          {validation ? (
            <p className="field-error" role="alert">
              {validation}
            </p>
          ) : null}
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="comment">
      <p className="comment-body prose">{comment.body}</p>
      <div className="comment-actions">
        <button type="button" className="button button-ghost" onClick={startEditing}>
          Edit
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  )
}

function AddCommentForm({
  articleId,
  onCreated,
}: {
  articleId: number
  onCreated: (comment: Comment) => void
}) {
  const fieldId = useId()
  const [body, setBody] = useState('')
  const [validation, setValidation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextBody = body.trim()
    if (!nextBody) {
      setError('')
      setValidation('Comment body is required.')
      return
    }

    setValidation('')
    setError('')
    setSubmitting(true)
    try {
      const created = await createComment(articleId, nextBody)
      onCreated(created)
      setBody('')
    } catch (err) {
      setError(errorMessage(err, 'Could not add the comment'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="stack-form add-comment" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={fieldId}>Add a comment</label>
        <textarea
          id={fieldId}
          name="body"
          rows={4}
          value={body}
          aria-invalid={Boolean(validation)}
          placeholder="Write a comment"
          onChange={(event) => {
            setBody(event.target.value)
            if (validation) setValidation('')
          }}
        />
      </div>
      {validation ? (
        <p className="field-error" role="alert">
          {validation}
        </p>
      ) : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </form>
  )
}
