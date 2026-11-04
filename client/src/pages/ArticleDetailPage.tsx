import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteArticle, errorMessage, isNotFound } from '../api.ts'
import { CommentSection } from '../components/CommentSection.tsx'
import { StatusBlock } from '../components/StatusBlock.tsx'
import { parseArticleId, useArticle } from '../hooks/useArticle.ts'

export default function ArticleDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const articleId = parseArticleId(params.articleId)
  const { article, error, loading, reload } = useArticle(articleId)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.title = article ? `${article.title} · Articles` : 'Article · Articles'
  }, [article])

  async function handleDelete() {
    if (!article) return
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteArticle(article.articleId)
      navigate('/')
    } catch (err) {
      setDeleteError(errorMessage(err, 'Could not delete the article'))
      setDeleting(false)
    }
  }

  return (
    <>
      <Link to="/" className="back-link">
        All articles
      </Link>

      {loading ? <StatusBlock tone="loading" title="Loading article…" /> : null}

      {!loading && (articleId === null || isNotFound(error)) ? (
        <StatusBlock
          tone="empty"
          title="Article not found"
          action={
            <Link to="/" className="button button-primary">
              Back to articles
            </Link>
          }
        >
          That article does not exist, or it has been deleted.
        </StatusBlock>
      ) : null}

      {!loading && error && !isNotFound(error) && articleId !== null ? (
        <StatusBlock
          tone="error"
          title="Could not load the article"
          action={
            <button type="button" className="button button-ghost" onClick={reload}>
              Try again
            </button>
          }
        >
          {errorMessage(error, 'Something went wrong while loading this article.')}
        </StatusBlock>
      ) : null}

      {!loading && article ? (
        <>
          <article className="article-detail">
            <h1>{article.title}</h1>
            <div className="article-actions">
              <button
                type="button"
                className="button button-ghost"
                onClick={() => navigate(`/articles/${article.articleId}/edit`)}
              >
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
            {deleteError ? (
              <p className="field-error" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="prose article-contents">{article.contents}</div>
          </article>
          <CommentSection articleId={article.articleId} />
        </>
      ) : null}
    </>
  )
}
