import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import styles from './button.module.css'

const buttonVariants = cva(
  styles.button,
  {
    variants: {
      variant: {
        default: styles.variantDefault,
        ghost: styles.variantGhost,
        outline: styles.variantOutline,
        link: styles.variantLink,
      },
      size: {
        default: styles.sizeDefault,
        sm: styles.sizeSm,
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

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
