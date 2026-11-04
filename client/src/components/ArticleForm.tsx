import { useState, type FormEvent } from 'react'
import type { ArticleInput } from '../types'

type FieldErrors = {
  title?: string
  contents?: string
}

type ArticleFormProps = {
  heading: string
  description: string
  submitLabel: string
  initialTitle: string
  initialContents: string
  serverError: string | null
  onSubmit: (input: ArticleInput) => Promise<void>
}

export default function ArticleForm({
  heading,
  description,
  submitLabel,
  initialTitle,
  initialContents,
  serverError,
  onSubmit,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [contents, setContents] = useState(initialContents)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FieldErrors = {}
    if (!title.trim()) nextErrors.title = 'Title cannot be blank.'
    else if (title.trim().length > 255)
      nextErrors.title = 'Title must be 255 characters or fewer.'
    if (!contents.trim()) nextErrors.contents = 'Contents cannot be blank.'
    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.contents) return

    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), contents: contents.trim() })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="panel">
      <h1>{heading}</h1>
      <p className="lede">{description}</p>
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <p className="banner error" role="alert">
            {serverError}
          </p>
        )}
        <div className="field">
          <label htmlFor="article-title">Title</label>
          <input
            id="article-title"
            name="title"
            value={title}
            maxLength={255}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'article-title-error' : undefined}
          />
          {errors.title && (
            <p id="article-title-error" className="field-error" role="alert">
              {errors.title}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="article-contents">Contents</label>
          <textarea
            id="article-contents"
            name="contents"
            rows={10}
            value={contents}
            onChange={(event) => setContents(event.target.value)}
            aria-invalid={errors.contents ? true : undefined}
            aria-describedby={
              errors.contents ? 'article-contents-error' : undefined
            }
          />
          {errors.contents && (
            <p id="article-contents-error" className="field-error" role="alert">
              {errors.contents}
            </p>
          )}
        </div>
        <div className="button-row">
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  )
}
