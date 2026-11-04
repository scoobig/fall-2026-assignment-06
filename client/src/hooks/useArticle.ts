import { useEffect, useState } from 'react'
import { getArticle, isAbortError } from '../api.ts'
import type { Article } from '../types.ts'

export function parseArticleId(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null
  const id = Number(raw)
  if (!Number.isSafeInteger(id) || id <= 0) return null
  return id
}

type ArticleSnapshot = {
  articleId: number
  reloadKey: number
  article: Article | null
  error: unknown
}

export function useArticle(articleId: number | null) {
  const [snapshot, setSnapshot] = useState<ArticleSnapshot | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (articleId === null) return

    const controller = new AbortController()
    const requestedId = articleId
    const requestedKey = reloadKey

    getArticle(requestedId, controller.signal)
      .then((article) => {
        if (controller.signal.aborted) return
        setSnapshot({
          articleId: requestedId,
          reloadKey: requestedKey,
          article,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return
        setSnapshot({
          articleId: requestedId,
          reloadKey: requestedKey,
          article: null,
          error: err,
        })
      })

    return () => controller.abort()
  }, [articleId, reloadKey])

  const settled =
    articleId !== null &&
    snapshot !== null &&
    snapshot.articleId === articleId &&
    snapshot.reloadKey === reloadKey

  return {
    article: settled ? snapshot.article : null,
    error: settled ? snapshot.error : null,
    loading: articleId !== null && !settled,
    reload: () => setReloadKey((value) => value + 1),
  }
}
