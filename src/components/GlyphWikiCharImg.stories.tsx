import type { ReactNode } from 'react'
import GlyphWikiCharImg from './GlyphWikiCharImg'
import surfaceStyles from './Surface.module.css'
import charFrameStyles from './MojidataCharFrame.module.css'

const meta = {
  title: 'Search/Pure Views/GlyphWikiCharImg',
  component: GlyphWikiCharImg,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pure image view used by search and idsfind result lists. In Storybook it uses a fixture SVG so the glyph frame and fallback styling can be checked without the app API server.',
      },
    },
  },
  args: {
    char: '漢',
    size: 55,
    alt: '漢',
    debugSrc: '/storybook-fixtures/glyphwiki-u6f22.svg',
  },
  decorators: [
    (Story: () => ReactNode) => (
      <div
        style={{
          background: '#fff',
          padding: '24px',
        }}
      >
        <div
          className={[
            surfaceStyles.whiteGlyphSurface,
            surfaceStyles.radiusFrame,
            charFrameStyles.char,
          ].join(' ')}
          style={{
            width: '64px',
            height: '64px',
            fontSize: '50px',
            lineHeight: '55px',
            margin: 0,
          }}
        >
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta

export const Default = {}
