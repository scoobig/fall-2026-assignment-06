import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage, isNotFound, updateArticle } from '../api.ts'
import { ArticleForm } from '../components/ArticleForm.tsx'
import { StatusBlock } from '../components/StatusBlock.tsx'
import { parseArticleId, useArticle } from '../hooks/useArticle.ts'

export default function EditArticlePage() {
  const params = useParams()
  const navigate = useNavigate()
  const articleId = parseArticleId(params.articleId)
  const { article, error, loading, reload } = useArticle(articleId)

  useEffect(() => {
    document.title = article ? `Edit ${article.title} · Articles` : 'Edit article · Articles'
  }, [article])

  return (
    <>
      <Link
        to={articleId === null ? '/' : `/articles/${articleId}`}
        className="back-link"
      >
        {articleId === null ? 'All articles' : 'Back to article'}
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
          That article does not exist, so it cannot be edited.
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
        <ArticleForm
          key={`${article.articleId}:${article.title}:${article.contents}`}
          heading="Edit article"
          description="The fields below are filled with this article's current title and contents."
          submitLabel="Save changes"
          cancelHref={`/articles/${article.articleId}`}
          initialTitle={article.title}
          initialContents={article.contents}
          onSubmit={async (input) => {
            const updated = await updateArticle(article.articleId, input)
            navigate(`/articles/${updated.articleId}`)
          }}
        />
      ) : null}
    </>
  )
}
