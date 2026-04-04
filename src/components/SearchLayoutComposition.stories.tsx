import type { ReactNode } from 'react'
import articleCardStyles from './ArticleCard.module.css'
import compositionStyles from './CompositionStories.module.css'
import charFrameStyles from './MojidataCharFrame.module.css'
import formShellStyles from '@/features/formResultsShell.module.css'
import richTextStyles from './RichText.module.css'
import surfaceStyles from './Surface.module.css'
import textStyles from './Text.module.css'

function StoryFrame(props: { children: ReactNode }) {
  return (
    <div className={compositionStyles.storyFrame}>
      <div className={compositionStyles.page}>{props.children}</div>
    </div>
  )
}

function SearchFormPanel() {
  return (
    <div className={compositionStyles.stack}>
      <section
        className={[
          surfaceStyles.cardSurface,
          surfaceStyles.paddingLg,
          articleCardStyles.card,
          compositionStyles.stack,
        ].join(' ')}
      >
        <div className={compositionStyles.fieldStack}>
          <label className={compositionStyles.label} htmlFor="story-search-query">
            Query
          </label>
          <div
            id="story-search-query"
            className={[
              surfaceStyles.textFieldBase,
              surfaceStyles.textFieldFocus,
              surfaceStyles.radiusInset,
              compositionStyles.field,
            ].join(' ')}
          >
            漢
          </div>
          <p className={compositionStyles.helper}>
            Search form spacing should match the live results page.
          </p>
        </div>
      </section>
      <section
        className={[
          surfaceStyles.cardSurface,
          surfaceStyles.paddingMd,
          articleCardStyles.card,
          compositionStyles.examplesPanel,
        ].join(' ')}
      >
        <strong>Examples</strong>
        <div className={compositionStyles.examplesRow}>
          <span
            className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame}`}
          >
            水
          </span>
          <span
            className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame}`}
          >
            木
          </span>
          <span
            className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame}`}
          >
            山
          </span>
        </div>
      </section>
    </div>
  )
}

function ResultsPanel() {
  return (
    <section
      className={[
        surfaceStyles.cardSurface,
        surfaceStyles.paddingLg,
        articleCardStyles.card,
        compositionStyles.stack,
      ].join(' ')}
      data-testid="search-layout-composition"
    >
      <header className={compositionStyles.stack}>
        <h2 style={{ margin: 0 }}>Search Results</h2>
        <p className={compositionStyles.helper}>
          This story focuses on the spacing between the search form, section
          header, result cards, and pager.
        </p>
      </header>
      <div className={compositionStyles.resultList}>
        {[
          ['漢', 'U+6F22', 'A representative result card with glyph, label, and supporting text.'],
          ['漢', 'U+FA47', 'Spacing between cards should stay even when subtitle text wraps.'],
        ].map(([char, codepoint, body]) => (
          <a
            key={codepoint}
            href="#"
            className={[
              surfaceStyles.interactiveTileBase,
              surfaceStyles.interactiveTileHover,
              surfaceStyles.paddingMd,
              compositionStyles.resultCard,
            ].join(' ')}
          >
            <div className={compositionStyles.resultTitleRow}>
              <div
                className={[
                  surfaceStyles.whiteGlyphSurface,
                  surfaceStyles.radiusFrame,
                  compositionStyles.resultGlyph,
                  charFrameStyles.sourceHanSerif,
                ].join(' ')}
              >
                {char}
              </div>
              <div className={compositionStyles.resultMeta}>
                <span className={compositionStyles.resultTitle}>{char}</span>
                <span className={compositionStyles.resultSubtitle}>{codepoint}</span>
              </div>
            </div>
            <p
              className={[
                compositionStyles.resultBody,
                richTextStyles.richText,
                textStyles.mutedBodySm,
              ].join(' ')}
            >
              {body}
            </p>
          </a>
        ))}
      </div>
      <footer className={compositionStyles.pagerRow}>
        <a
          href="#"
          className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame}`}
        >
          Previous
        </a>
        <a
          href="#"
          className={`${surfaceStyles.pillBase} ${surfaceStyles.radiusFrame}`}
        >
          Next
        </a>
      </footer>
    </section>
  )
}

function SearchLayoutComposition(props: { mobile?: boolean }) {
  const { mobile = false } = props

  return (
    <StoryFrame>
      <main
        className={mobile ? compositionStyles.pageMain : formShellStyles.shell}
        data-testid="search-layout-page-composition"
      >
        <div
          className={mobile ? undefined : formShellStyles.desktopSticky}
          data-testid="search-layout-form-pane"
        >
          <SearchFormPanel />
        </div>
        <div className={formShellStyles.resultsPane}>
          <ResultsPanel />
        </div>
      </main>
    </StoryFrame>
  )
}

const meta = {
  title: 'App/Layout Compositions/SearchResultsPage',
  component: SearchLayoutComposition,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page-level composition for Search results. This story checks the spacing contract between the form column, examples panel, result list, and pager.',
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
