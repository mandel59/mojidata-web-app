import * as React from 'react'

import { cn } from '@/lib/utils'
import styles from './button.module.css'

const variantClasses = {
  default: styles.variantDefault,
  ghost: styles.variantGhost,
  outline: styles.variantOutline,
  link: styles.variantLink,
} as const

const sizeClasses = {
  default: styles.sizeDefault,
  sm: styles.sizeSm,
} as const

type ButtonVariant = keyof typeof variantClasses
type ButtonSize = keyof typeof sizeClasses

function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
  className?: string
} = {}) {
  return cn(
    styles.button,
    variant ? variantClasses[variant] : undefined,
    size ? sizeClasses[size] : undefined,
    className,
  )
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  {
    variant?: ButtonVariant
    size?: ButtonSize
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
