'use client'

import { ReactNode, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal(props: ModalProps) {
  const { open, title, onClose, children } = props

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-lg border border-border bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
          <h3 className="m-0 text-lg font-semibold">{title}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
