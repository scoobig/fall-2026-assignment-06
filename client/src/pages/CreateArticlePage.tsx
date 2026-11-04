import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createArticle } from '../api.ts'
import { ArticleForm } from '../components/ArticleForm.tsx'

export default function CreateArticlePage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Create article · Articles'
  }, [])

  return (
    <>
      <Link to="/" className="back-link">
        All articles
      </Link>
      <ArticleForm
        heading="Create article"
        description="Add a title and the full text. Both fields are required."
        submitLabel="Create article"
        cancelHref="/"
        onSubmit={async (article) => {
          const created = await createArticle(article)
          navigate(`/articles/${created.articleId}`)
        }}
      />
    </>
  )
}
