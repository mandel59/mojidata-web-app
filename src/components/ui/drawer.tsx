'use client'

import { ReactNode, useEffect, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import surfaceStyles from '@/components/Surface.module.css'
import overlayStyles from './OverlayChrome.module.css'
import styles from './Drawer.module.css'

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
      className={overlayStyles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          surfaceStyles.outlinedSurface,
          surfaceStyles.paddingLg,
          styles.drawer,
        )}
      >
        <div
          className={cn(
            surfaceStyles.headerDivider,
            overlayStyles.headerRow,
            styles.header,
          )}
        >
          <h3 id={titleId} className={styles.title}>{title}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  )
}
