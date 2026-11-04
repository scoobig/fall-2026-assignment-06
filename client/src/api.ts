import type { Article, ArticleInput, Comment } from './types.ts'

export const API_BASE = 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new Error(
      'Could not reach the API. Start the server on http://localhost:8080.',
    )
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = (await response.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // Some failures, including an empty article body, respond with no JSON.
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function listArticles(
  titleContains: string,
  signal?: AbortSignal,
): Promise<Article[]> {
  const params = new URLSearchParams()
  const trimmed = titleContains.trim()
  if (trimmed) params.set('title_contains', trimmed)
  const query = params.toString()
  return request<Article[]>(`/articles${query ? `?${query}` : ''}`, { signal })
}

export function getArticle(
  articleId: number,
  signal?: AbortSignal,
): Promise<Article> {
  return request<Article>(`/articles/${articleId}`, { signal })
}

export function createArticle(input: ArticleInput): Promise<Article> {
  return request<Article>('/articles', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateArticle(
  articleId: number,
  input: ArticleInput,
): Promise<Article> {
  return request<Article>(`/articles/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteArticle(articleId: number): Promise<Article> {
  return request<Article>(`/articles/${articleId}`, { method: 'DELETE' })
}

export function listComments(
  articleId: number,
  signal?: AbortSignal,
): Promise<Comment[]> {
  return request<Comment[]>(`/articles/${articleId}/comments`, { signal })
}

export function createComment(
  articleId: number,
  body: string,
): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function updateComment(
  articleId: number,
  commentId: number,
  body: string,
): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
  })
}

export function deleteComment(
  articleId: number,
  commentId: number,
): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments/${commentId}`, {
    method: 'DELETE',
  })
}
