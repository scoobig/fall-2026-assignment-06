import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage, isAbortError, listArticles } from '../api.ts'
import { StatusBlock } from '../components/StatusBlock.tsx'
import type { Article } from '../types.ts'

function previewText(contents: string, maxLength = 180): string {
  const normalized = contents.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength).trimEnd()}…`
}

type ArticleSnapshot = {
  query: string
  reloadKey: number
  articles: Article[] | null
  error: string
}

export default function ArticleListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [snapshot, setSnapshot] = useState<ArticleSnapshot | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    document.title = 'Articles'
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const requestedQuery = query
    const requestedKey = reloadKey

    listArticles(requestedQuery, controller.signal)
      .then((articles) => {
        if (controller.signal.aborted) return
        setSnapshot({
          query: requestedQuery,
          reloadKey: requestedKey,
          articles,
          error: '',
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return
        setSnapshot((current) => ({
          query: requestedQuery,
          reloadKey: requestedKey,
          articles: current?.articles ?? null,
          error: errorMessage(err, 'Could not load articles'),
        }))
      })

    return () => controller.abort()
  }, [query, reloadKey])

  const settled =
    snapshot !== null && snapshot.query === query && snapshot.reloadKey === reloadKey
  const articles = snapshot?.articles ?? null
  const error = settled ? snapshot.error : ''
  const refreshing = snapshot !== null && !settled
  const trimmedQuery = query.trim()
  const countLabel =
    articles === null
      ? ''
      : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`
  const resultLabel =
    snapshot === null || (error && articles === null)
      ? ''
      : refreshing
        ? 'Searching…'
        : countLabel

  return (
    <>
      <div className="page-header">
        <h1>Articles</h1>
        <p className="lede">Browse every article, or create a new one.</p>
      </div>

      <div className="toolbar">
        <form
          className="search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <label htmlFor="title-search">Search by title</label>
          <input
            id="title-search"
            name="title_contains"
            type="search"
            value={query}
            placeholder="Search by title"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        <button
          type="button"
          className="button button-primary"
          onClick={() => navigate('/articles/new')}
        >
          Create article
        </button>
      </div>

      {resultLabel ? (
        <p className="result-meta" role="status" aria-live="polite">
          {trimmedQuery && settled && !error
            ? `${resultLabel} matching “${trimmedQuery}”`
            : resultLabel}
        </p>
      ) : null}

      {error && articles === null ? (
        <StatusBlock
          tone="error"
          title="Could not load articles"
          action={
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Try again
            </button>
          }
        >
          {error}
        </StatusBlock>
      ) : null}

      {error && articles !== null ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      {articles === null && !error ? (
        <StatusBlock tone="loading" title="Loading articles…" />
      ) : null}

      {settled && !error && articles && articles.length === 0 ? (
        <StatusBlock
          tone="empty"
          title={trimmedQuery ? 'No matching articles' : 'No articles yet'}
          action={
            trimmedQuery ? undefined : (
              <button
                type="button"
                className="button button-primary"
                onClick={() => navigate('/articles/new')}
              >
                Create article
              </button>
            )
          }
        >
          {trimmedQuery
            ? `No articles found with “${trimmedQuery}” in the title.`
            : 'The list is empty. Create the first article to get started.'}
        </StatusBlock>
      ) : null}

      {articles && articles.length > 0 ? (
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.articleId}>
              <article className="article-card">
                <h2>
                  <Link to={`/articles/${article.articleId}`}>{article.title}</Link>
                </h2>
                <p className="preview">{previewText(article.contents)}</p>
                <Link className="text-link" to={`/articles/${article.articleId}`}>
                  Read article
                </Link>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
