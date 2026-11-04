import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage, listArticles } from '../api'
import type { Article } from '../types'

function preview(contents: string, maxLength = 180): string {
  const flat = contents.replace(/\s+/g, ' ').trim()
  if (flat.length <= maxLength) return flat
  return `${flat.slice(0, maxLength).trimEnd()}…`
}

export default function ArticleListPage() {
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [seenQuery, setSeenQuery] = useState(appliedQuery)
  const [seenReload, setSeenReload] = useState(reloadKey)

  if (seenQuery !== appliedQuery || seenReload !== reloadKey) {
    setSeenQuery(appliedQuery)
    setSeenReload(reloadKey)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    const handle = window.setTimeout(() => setAppliedQuery(query), 250)
    return () => window.clearTimeout(handle)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    listArticles(appliedQuery, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setArticles(next)
        setHasLoaded(true)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setArticles([])
        setError(errorMessage(err))
        setLoading(false)
      })
    return () => controller.abort()
  }, [appliedQuery, reloadKey])

  function searchNow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedQuery(query)
  }

  const searching = query.trim().length > 0

  return (
    <section>
      <div className="page-intro">
        <h1>All articles</h1>
        <p className="lede">
          Browse every article, or search by title. Search runs on the server.
        </p>
      </div>

      <div className="list-toolbar">
        <form className="search" role="search" onSubmit={searchNow}>
          <div className="field">
            <label htmlFor="title-search">Search by title</label>
            <input
              id="title-search"
              name="title_contains"
              value={query}
              placeholder="Title contains…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button type="submit" className="button">
            Search
          </button>
        </form>
        <Link to="/articles/new" className="button primary">
          Create article
        </Link>
      </div>

      {loading && !hasLoaded && <p className="status">Loading articles…</p>}
      {loading && hasLoaded && <p className="status">Updating results…</p>}
      {error && (
        <div className="banner error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && hasLoaded && articles.length === 0 && (
        <p className="status">
          {searching
            ? `No articles found for “${query.trim()}”.`
            : 'No articles yet.'}
        </p>
      )}

      {!error && articles.length > 0 && (
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.articleId}>
              <Link
                to={`/articles/${article.articleId}`}
                className="article-card"
              >
                <h2>{article.title}</h2>
                <p>{preview(article.contents)}</p>
                <span className="read-more">Read article</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
