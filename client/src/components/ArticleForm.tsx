import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api.ts'
import type { ArticleInput } from '../types.ts'

type ArticleFormProps = {
  heading: string
  description: string
  submitLabel: string
  cancelHref: string
  initialTitle?: string
  initialContents?: string
  onSubmit: (article: ArticleInput) => Promise<void>
}

export function ArticleForm({
  heading,
  description,
  submitLabel,
  cancelHref,
  initialTitle = '',
  initialContents = '',
  onSubmit,
}: ArticleFormProps) {
  const titleId = useId()
  const contentsId = useId()
  const messageId = useId()
  const titleRef = useRef<HTMLInputElement>(null)
  const contentsRef = useRef<HTMLTextAreaElement>(null)
  const [title, setTitle] = useState(initialTitle)
  const [contents, setContents] = useState(initialContents)
  const [validation, setValidation] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const titleMissing = title.trim() === ''
  const contentsMissing = contents.trim() === ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (titleMissing || contentsMissing) {
      setFormError('')
      setValidation(
        titleMissing && contentsMissing
          ? 'Title and contents are required.'
          : titleMissing
            ? 'Title is required.'
            : 'Contents are required.',
      )
      if (titleMissing) titleRef.current?.focus()
      else contentsRef.current?.focus()
      return
    }

    setValidation('')
    setFormError('')
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), contents: contents.trim() })
    } catch (error) {
      setFormError(errorMessage(error, 'Could not save the article'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit} noValidate>
      <div className="page-header">
        <h1>{heading}</h1>
        <p className="lede">{description}</p>
      </div>

      <div className="field">
        <label htmlFor={titleId}>Title</label>
        <input
          ref={titleRef}
          id={titleId}
          name="title"
          type="text"
          value={title}
          aria-invalid={Boolean(validation) && titleMissing}
          aria-describedby={validation || formError ? messageId : undefined}
          onChange={(event) => {
            setTitle(event.target.value)
            if (validation) setValidation('')
          }}
          placeholder="Title"
        />
      </div>

      <div className="field">
        <label htmlFor={contentsId}>Contents</label>
        <textarea
          ref={contentsRef}
          id={contentsId}
          name="contents"
          rows={12}
          value={contents}
          aria-invalid={Boolean(validation) && contentsMissing}
          aria-describedby={validation || formError ? messageId : undefined}
          onChange={(event) => {
            setContents(event.target.value)
            if (validation) setValidation('')
          }}
          placeholder="Write the full article"
        />
      </div>

      {validation ? (
        <p id={messageId} className="field-error" role="alert">
          {validation}
        </p>
      ) : null}
      {formError ? (
        <p id={validation ? undefined : messageId} className="field-error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <Link to={cancelHref} className="button button-ghost">
          Cancel
        </Link>
      </div>
    </form>
  )
}
