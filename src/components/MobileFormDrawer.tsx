'use client'

import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'

export interface MobileFormDrawerProps {
  buttonLabel: string
  title: string
  children: ReactNode
}

export default function MobileFormDrawer({ buttonLabel, title, children }: MobileFormDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {buttonLabel}
      </Button>
      <Drawer open={open} title={title} onClose={() => setOpen(false)}>
        {children}
      </Drawer>
    </>
  )
}
