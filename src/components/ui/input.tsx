import * as React from 'react'

import { cn } from '@/lib/utils'
import styles from './input.module.css'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(styles.input, className)}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
