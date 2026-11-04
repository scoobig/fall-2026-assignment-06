import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteArticle, errorMessage, getArticle } from '../api'
import CommentSection from '../components/CommentSection'
import type { Article } from '../types'

function parseArticleId(raw: string | undefined): number | null {
  if (!raw) return null
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export default function ArticleDetailPage() {
  const { articleId: rawId } = useParams()
  const navigate = useNavigate()
  const articleId = parseArticleId(rawId)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeId, setActiveId] = useState(articleId)

  if (articleId !== activeId) {
    setActiveId(articleId)
    setArticle(null)
    setLoading(articleId !== null)
    setError(null)
    setDeleting(false)
  }

  useEffect(() => {
    if (articleId === null) return
    const controller = new AbortController()
    getArticle(articleId, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setArticle(next)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setArticle(null)
        setError(errorMessage(err))
        setLoading(false)
      })
    return () => controller.abort()
  }, [articleId])

  async function handleDelete() {
    if (!article) return
    setDeleting(true)
    setError(null)
    try {
      await deleteArticle(article.articleId)
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
      setDeleting(false)
    }
  }

  if (articleId === null) {
    return (
      <section className="panel">
        <h1>Article not found</h1>
        <p className="banner error" role="alert">
          That article does not exist.
        </p>
        <Link to="/" className="button">
          Back to articles
        </Link>
      </section>
    )
  }

  if (loading) return <p className="status">Loading article…</p>

  if (!article) {
    return (
      <section className="panel">
        <h1>Article not found</h1>
        <p className="banner error" role="alert">
          {error ?? 'That article does not exist.'}
        </p>
        <Link to="/" className="button">
          Back to articles
        </Link>
      </section>
    )
  }

  return (
    <article className="article-detail">
      <p className="back-row">
        <Link to="/" className="back-link">
          All articles
        </Link>
      </p>
      <h1>{article.title}</h1>
      <div className="button-row">
        <Link to={`/articles/${article.articleId}/edit`} className="button">
          Edit
        </Link>
        <button
          type="button"
          className="button danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}
      <div className="article-contents">{article.contents}</div>
      <CommentSection key={article.articleId} articleId={article.articleId} />
    </article>
  )
}
