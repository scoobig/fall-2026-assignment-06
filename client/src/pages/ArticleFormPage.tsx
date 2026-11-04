import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createArticle,
  errorMessage,
  getArticle,
  updateArticle,
} from '../api'
import ArticleForm from '../components/ArticleForm'
import type { Article, ArticleInput } from '../types'

type ArticleFormPageProps = {
  mode: 'create' | 'edit'
}

function parseArticleId(raw: string | undefined): number | null {
  if (!raw) return null
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export default function ArticleFormPage({ mode }: ArticleFormPageProps) {
  const { articleId: rawId } = useParams()
  const navigate = useNavigate()
  const articleId = parseArticleId(rawId)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(mode === 'edit')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState(articleId)

  if (mode === 'edit' && articleId !== activeId) {
    setActiveId(articleId)
    setArticle(null)
    setLoading(articleId !== null)
    setLoadError(null)
    setSubmitError(null)
  }

  useEffect(() => {
    if (mode !== 'edit' || articleId === null) return
    const controller = new AbortController()
    getArticle(articleId, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return
        setArticle(next)
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(errorMessage(error))
        setLoading(false)
      })
    return () => controller.abort()
  }, [mode, articleId])

  async function handleSubmit(input: ArticleInput) {
    setSubmitError(null)
    try {
      if (mode === 'create') {
        const created = await createArticle(input)
        navigate(`/articles/${created.articleId}`)
        return
      }
      if (articleId === null) return
      const updated = await updateArticle(articleId, input)
      navigate(`/articles/${updated.articleId}`)
    } catch (error) {
      setSubmitError(errorMessage(error))
    }
  }

  if (mode === 'edit' && articleId === null) {
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

  if (mode === 'edit' && loading) return <p className="status">Loading article…</p>

  if (mode === 'edit' && (loadError || !article)) {
    return (
      <section className="panel">
        <h1>Article not found</h1>
        <p className="banner error" role="alert">
          {loadError ?? 'That article does not exist.'}
        </p>
        <Link to="/" className="button">
          Back to articles
        </Link>
      </section>
    )
  }

  const backTo = mode === 'edit' && article ? `/articles/${article.articleId}` : '/'

  return (
    <div>
      <p className="back-row">
        <Link to={backTo} className="back-link">
          {mode === 'edit' ? 'Back to article' : 'All articles'}
        </Link>
      </p>
      <ArticleForm
        key={mode === 'edit' ? article?.articleId : 'new'}
        heading={mode === 'edit' ? 'Edit article' : 'Create article'}
        description={
          mode === 'edit'
            ? 'Update the title or contents, then save to return to the article.'
            : 'Both fields are required. After you publish, you will land on the new article.'
        }
        submitLabel={mode === 'edit' ? 'Save changes' : 'Publish article'}
        initialTitle={article?.title ?? ''}
        initialContents={article?.contents ?? ''}
        serverError={submitError}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
