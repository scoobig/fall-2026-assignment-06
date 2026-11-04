import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="brand">
          Articles
        </Link>
        <nav aria-label="Primary">
          <Link to="/articles/new" className="button primary">
            Create article
          </Link>
        </nav>
      </header>
      <main className="wrap">
        <Outlet />
      </main>
    </div>
  )
}
