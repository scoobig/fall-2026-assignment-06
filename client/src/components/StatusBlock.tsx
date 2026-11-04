import type { ReactNode } from 'react'

type StatusBlockProps = {
  tone: 'loading' | 'empty' | 'error'
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function StatusBlock({ tone, title, children, action }: StatusBlockProps) {
  return (
    <div
      className={`status-block status-${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {action ? <div className="status-action">{action}</div> : null}
    </div>
  )
}
