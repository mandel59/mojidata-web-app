'use client'

import { ReactNode, useState, useSyncExternalStore } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'

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
      <details className="rounded-md border border-border bg-card p-2">
        <summary
          className={`${buttonVariants({ size: 'sm' })} w-full cursor-pointer list-none justify-center [&::-webkit-details-marker]:hidden`}
        >
          {buttonLabel}
        </summary>
        <div className="mt-3">{children}</div>
      </details>
    )
  }

  return (
    <div className="rounded-md border border-border bg-card p-2">
      <Button
        type="button"
        size="sm"
        className="w-full justify-center"
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
