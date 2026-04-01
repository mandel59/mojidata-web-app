'use client'

import { ReactNode, useState, useSyncExternalStore } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import surfaceStyles from './Surface.module.css'
import styles from './MobileFormDrawer.module.css'

export interface MobileFormDrawerProps {
  buttonLabel: string
  title: string
  children: ReactNode
}

export default function MobileFormDrawer({
  buttonLabel,
  title,
  children,
}: MobileFormDrawerProps) {
  const [open, setOpen] = useState(false)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!hydrated) {
    return (
      <details
        className={cn(
          surfaceStyles.cardSurface,
          surfaceStyles.radiusSm,
          surfaceStyles.paddingSm,
        )}
      >
        <summary
          className={cn(buttonVariants({ size: 'sm' }), styles.fallbackSummary)}
        >
          {buttonLabel}
        </summary>
        <div className={styles.fallbackContent}>{children}</div>
      </details>
    )
  }

  return (
    <div
      className={cn(
        surfaceStyles.cardSurface,
        surfaceStyles.radiusSm,
        surfaceStyles.paddingSm,
      )}
    >
      <Button
        type="button"
        size="sm"
        className={styles.trigger}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </Button>
      <Drawer open={open} title={title} onClose={() => setOpen(false)}>
        {children}
      </Drawer>
    </div>
  )
}
