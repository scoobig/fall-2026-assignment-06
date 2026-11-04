export type Article = {
  articleId: number
  title: string
  contents: string
}

export type Comment = {
  commentId: number
  articleId: number
  body: string
}

export type ArticleInput = {
  title: string
  contents: string
}
