import { NavLink, Route, Routes } from 'react-router-dom'
import ArticleDetailPage from './pages/ArticleDetailPage.tsx'
import ArticleListPage from './pages/ArticleListPage.tsx'
import CreateArticlePage from './pages/CreateArticlePage.tsx'
import EditArticlePage from './pages/EditArticlePage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link'
}

function createClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'button button-primary active' : 'button button-primary'
}

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="shell header-row">
          <NavLink to="/" end className="brand">
            <span className="brand-mark" aria-hidden="true">
              A
            </span>
            <span>Articles</span>
          </NavLink>
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end className={navClass}>
              All articles
            </NavLink>
            <NavLink to="/articles/new" className={createClass}>
              New article
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="shell">
        <Routes>
          <Route path="/" element={<ArticleListPage />} />
          <Route path="/articles/new" element={<CreateArticlePage />} />
          <Route path="/articles/:articleId/edit" element={<EditArticlePage />} />
          <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="shell">Articles and the comments left on them.</div>
      </footer>
    </div>
  )
}
