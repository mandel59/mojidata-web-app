import type { ReactNode } from 'react'
import type { MojidataVariantEntry } from '@/components/mojidataVariantEntry'
import MojidataDeferredVariantsView from './MojidataDeferredVariantsView'
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

function StoryFrame(props: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '24px',
        background: 'hsl(var(--muted) / 0.2)',
      }}
    >
      {props.children}
    </div>
  )
}

const meta = {
  title: 'Mojidata/Pure Views/MojidataDeferredVariantsView',
  component: MojidataDeferredVariantsView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pure view for deferred Mojidata variant cards. Expansion state, label text, and entry rendering are injected so the layout can be verified independently of client state and glyph-loading behavior.',
      },
    },
  },
  args: {
    entries,
    expanded: false,
    toggleLabel: 'Show 2 more variants',
    renderEntryContent: (entry: MojidataVariantEntry) => entry.char,
  },
  decorators: [
    (Story: () => ReactNode) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
}

export default meta

export const Collapsed = {}

export const Expanded = {
  args: {
    expanded: true,
    toggleLabel: 'Show fewer variants',
  },
}
