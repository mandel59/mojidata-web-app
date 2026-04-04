import * as React from 'react'

import { cn } from '@/lib/utils'
import surfaceStyles from '@/components/Surface.module.css'
import textStyles from '@/components/Text.module.css'
import styles from './input.module.css'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          surfaceStyles.textFieldBase,
          surfaceStyles.textFieldFocus,
          surfaceStyles.radiusInset,
          textStyles.placeholderMuted,
          styles.input,
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
