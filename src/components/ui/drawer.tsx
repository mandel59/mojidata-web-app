'use client'

import { ReactNode, useEffect, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  const id = useId()
  const titleId = `${id}-title`
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-xl border border-border bg-card p-4 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
          <h3 id={titleId} className="m-0 text-base font-semibold">{title}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  )
}
