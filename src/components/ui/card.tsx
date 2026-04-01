import * as React from 'react'

import { cn } from '@/lib/utils'
import surfaceStyles from '@/components/Surface.module.css'
import styles from './card.module.css'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(surfaceStyles.cardSurface, styles.card, className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(styles.header, className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(styles.title, className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(styles.content, className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardContent }
