import { cn } from '@/lib/utils'
import styles from './MojiJohoChar.module.css'
import surfaceStyles from './Surface.module.css'

export interface MojiJohoDisplayModeControlViewProps {
  label: string
  autoLabel: string
  imageLabel: string
  forceImage: boolean
  onSelectAuto?: () => void
  onSelectImage?: () => void
}

export default function MojiJohoDisplayModeControlView(
  props: MojiJohoDisplayModeControlViewProps,
) {
  const {
    label,
    autoLabel,
    imageLabel,
    forceImage,
    onSelectAuto,
    onSelectImage,
  } = props

  return (
    <div
      className={styles.displayModeControl}
      data-testid="moji-joho-display-mode-control"
    >
      <span>{label}</span>
      <button
        type="button"
        className={cn(
          surfaceStyles.pillBase,
          styles.button,
          !forceImage && styles.buttonActive,
        )}
        onClick={onSelectAuto}
        data-testid="moji-joho-display-mode-auto"
      >
        {autoLabel}
      </button>
      <button
        type="button"
        className={cn(
          surfaceStyles.pillBase,
          styles.button,
          forceImage && styles.buttonActive,
        )}
        onClick={onSelectImage}
        data-testid="moji-joho-display-mode-image"
      >
        {imageLabel}
      </button>
    </div>
  )
}
