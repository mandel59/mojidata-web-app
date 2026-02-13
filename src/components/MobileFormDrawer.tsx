'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
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
