import type { Article, ArticleInput, Comment } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new Error(
      'Could not reach the API. Start the server on http://localhost:8080 and try again.',
    )
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const data: unknown = await response.json()
      if (
        data &&
        typeof data === 'object' &&
        'error' in data &&
        typeof data.error === 'string' &&
        data.error
      ) {
        message = data.error
      }
    } catch {
      // Some error responses, such as 400 from article create, have no body.
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
  const query = titleContains.trim()
  if (query) params.set('title_contains', query)
  const search = params.toString()
  return request<Article[]>(`/articles${search ? `?${search}` : ''}`, { signal })
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
