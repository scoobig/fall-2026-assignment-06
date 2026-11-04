import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="panel">
      <h1>Page not found</h1>
      <p className="lede">That address does not match any view in this app.</p>
      <Link to="/" className="button">
        Back to articles
      </Link>
    </section>
  )
}
