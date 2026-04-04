import type { ReactNode } from 'react'
import responseStyles from '@/app/[lang]/mojidata/[char]/MojidataResponseView.module.css'
import articleCardStyles from './ArticleCard.module.css'
import compositionStyles from './CompositionStories.module.css'
import DeferredCharSvgImageView from './DeferredCharSvgImageView'
import MojidataDeferredVariantsView from './MojidataDeferredVariantsView'
import type { MojidataVariantEntry } from './mojidataVariantEntry'
import MojidataSectionNavView from './MojidataSectionNavView'
import MojiJohoDisplayModeControlView from './MojiJohoDisplayModeControlView'
import comparisonStyles from './MojidataComparison.module.css'
import charFrameStyles from './MojidataCharFrame.module.css'
import richTextStyles from './RichText.module.css'
import surfaceStyles from './Surface.module.css'
import textStyles from './Text.module.css'

const sections = [
  { id: 'Character_Data', label: 'Character Data' },
  { id: 'Moji_Joho', label: 'Moji_Joho' },
  { id: 'Variants', label: 'Variants' },
  { id: 'Regional_Variants', label: 'Regional Variants' },
]

const variantEntries: MojidataVariantEntry[] = [
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
    <div className={compositionStyles.storyFrame}>
      <div className={compositionStyles.page}>{props.children}</div>
    </div>
  )
}

function SummaryGlyph() {
  return (
    <div
      className={`${surfaceStyles.whiteGlyphSurface} ${surfaceStyles.radiusFrame} ${charFrameStyles.char}`}
    >
      <DeferredCharSvgImageView
        char="漢"
        size={110}
        source="glyphwiki"
        loaded
        renderImage
        imageSrc="/storybook-fixtures/glyphwiki-u6f22.svg"
        alt="漢"
      />
    </div>
  )
}

function ContentArticle() {
  return (
    <article
      className={[
        surfaceStyles.cardSurface,
        surfaceStyles.paddingLg,
        articleCardStyles.card,
        responseStyles.response,
        responseStyles.contentMain,
        richTextStyles.richText,
        compositionStyles.articleSurface,
      ].join(' ')}
    >
      <h2 id="Character_Data">Character Data</h2>
      <p>
        This story keeps the real `mojidata` page spacing between the summary
        card, TOC sidebar, section headings, and comparison blocks.
      </p>
      <div className={responseStyles.summaryBadgeRow}>
        <span
          className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame} ${responseStyles.badge}`}
        >
          JMJ
        </span>
        <span
          className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame} ${responseStyles.badge}`}
        >
          IPA
        </span>
      </div>
      <h2 id="Moji_Joho">Moji_Joho</h2>
      <p>
        The display control should sit close to the section heading, with the
        comparison frame below it and body copy aligned to the same content
        column.
      </p>
      <MojiJohoDisplayModeControlView
        label="Display"
        autoLabel="Auto"
        imageLabel="Image"
        forceImage={false}
      />
      <div
        className={`${surfaceStyles.whiteGlyphSurface} ${surfaceStyles.radiusFrame} ${charFrameStyles.char}`}
      >
      <DeferredCharSvgImageView
        char="𠀂"
        size={110}
        source="ipamjm"
        loaded
        renderImage
        imageSrc="/storybook-fixtures/ipamjm-u3402.svg"
        alt="𠀂"
      />
      </div>
      <h2 id="Variants">Variants</h2>
      <p className={textStyles.mutedFg}>
        Variants should have a clear top margin from the preceding paragraph and
        a consistent gap between cards.
      </p>
      <MojidataDeferredVariantsView
        entries={variantEntries}
        expanded
        toggleLabel="Show fewer variants"
        renderEntryContent={(entry) => entry.char}
      />
      <h2 id="Regional_Variants">Regional Variants</h2>
      <p>
        Regional comparison blocks should remain aligned with the main text
        column.
      </p>
    </article>
  )
}

function MojidataLayoutComposition(props: { mobile?: boolean }) {
  const { mobile = false } = props

  return (
    <StoryFrame>
      <main
        className={compositionStyles.pageMain}
        data-testid="mojidata-layout-composition"
      >
        <section
          className={[
            surfaceStyles.mutedPanelSurface,
            surfaceStyles.radiusLg,
            surfaceStyles.paddingMd,
            responseStyles.summaryWrap,
            compositionStyles.summaryCard,
          ].join(' ')}
        >
          <div className={responseStyles.summaryActions}>
            <button
              type="button"
              className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame}`}
            >
              Permalink
            </button>
          </div>
          <div className={responseStyles.summaryGrid}>
            <div className={compositionStyles.summaryGlyph}>
              <SummaryGlyph />
            </div>
            <dl className={responseStyles.summaryKv}>
              <div className={responseStyles.summaryRow}>
                <dt>UCS</dt>
                <dd>U+6F22</dd>
              </div>
              <div className={responseStyles.summaryRow}>
                <dt>Radical</dt>
                <dd>85 Water</dd>
              </div>
              <div className={responseStyles.summaryRow}>
                <dt>Readings</dt>
                <dd>かん / han4</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className={responseStyles.contentGrid}>
          <MojidataSectionNavView
            sections={sections}
            activeSectionId={mobile ? 'Moji_Joho' : 'Character_Data'}
          />
          <ContentArticle />
        </section>
      </main>
    </StoryFrame>
  )
}

const meta = {
  title: 'App/Layout Compositions/MojidataPage',
  component: MojidataLayoutComposition,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page-level composition for Mojidata. This story is meant to catch spacing issues between summary cards, section navigation, headings, controls, and comparison blocks.',
      },
    },
  },
}

export default meta

export const Desktop = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}

export const Mobile = {
  args: {
    mobile: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
