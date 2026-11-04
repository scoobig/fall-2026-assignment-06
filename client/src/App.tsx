import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ArticleFormPage from './pages/ArticleFormPage'
import ArticleListPage from './pages/ArticleListPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ArticleListPage />} />
          <Route path="articles/new" element={<ArticleFormPage mode="create" />} />
          <Route path="articles/:articleId" element={<ArticleDetailPage />} />
          <Route
            path="articles/:articleId/edit"
            element={<ArticleFormPage mode="edit" />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
