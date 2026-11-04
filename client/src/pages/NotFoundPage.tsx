import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatusBlock } from '../components/StatusBlock.tsx'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found · Articles'
  }, [])

  return (
    <StatusBlock
      tone="empty"
      title="Page not found"
      action={
        <Link to="/" className="button button-primary">
          Back to articles
        </Link>
      }
    >
      That page is not part of this app.
    </StatusBlock>
  )
}
