import type { ReactNode } from 'react'
import MojidataDeferredVariants from './MojidataDeferredVariants'
import type { MojidataVariantEntry } from './mojidataVariantEntry'
import charFrameStyles from './MojidataCharFrame.module.css'
import comparisonStyles from './MojidataComparison.module.css'

const entries: MojidataVariantEntry[] = [
  {
    key: 'u+6f22',
    heading: 'U+6F22',
    char: '漢',
    href: '/mojidata/%E6%BC%A2',
    className: `${comparisonStyles.frame} ${comparisonStyles.variantFrame} ${charFrameStyles.char}`,
    useGlyphImage: false,
    relationLines: [{ label: 'UCS', values: 'U+6F22' }],
  },
  {
    key: 'u+6c49',
    heading: 'U+6C49',
    char: '汉',
    href: '/mojidata/%E6%B1%89',
    className: `${comparisonStyles.frame} ${comparisonStyles.variantFrame} ${charFrameStyles.char}`,
    useGlyphImage: false,
    relationLines: [{ label: 'Regional', values: 'CN' }],
  },
]

const meta = {
  title: 'Mojidata/Interactive/MojidataDeferredVariants',
  component: MojidataDeferredVariants,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive controller for deferred Mojidata variants. This story retains client expansion state, so it remains under Interactive while the pure card layout is covered separately.',
      },
    },
  },
  args: {
    lang: 'en-US',
    entries,
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div
        style={{
          padding: '24px',
          background: 'hsl(var(--muted) / 0.2)',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta

export const Default = {}
