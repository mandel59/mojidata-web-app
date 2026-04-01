import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const DEFAULT_PROPERTIES = [
  'display',
  'position',
  'width',
  'max-width',
  'min-width',
  'height',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'padding-bottom',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background-color',
  'font-size',
  'line-height',
  'justify-content',
  'align-items',
  'grid-template-columns',
  'box-sizing',
]

function printHelp() {
  console.log(`Usage:
  npm run compare:styles -- \\
    --current-url 'http://127.0.0.1:3000/ja-JP/mojidata/%E6%BC%A2' \\
    --baseline-url 'http://127.0.0.1:3002/ja-JP/mojidata/%E6%BC%A2' \\
    --wait-for '[data-testid="mojidata-summary-wrap"], .mojidata-summary-wrap' \\
    --selector 'header=header' \\
    --selector 'article=article'

Options:
  --config <path>           Read options from a JSON file.
  --current-url <url>       URL to inspect in the current workspace.
  --baseline-url <url>      URL to inspect in the baseline workspace.
  --user-agent <string>     Browser user agent to use while capturing.
  --wait-for <selector>     Selector to wait for before snapshotting.
  --selector <name=css>     Repeated named selector entries to capture.
  --property <name>         Repeated computed-style property to capture.
  --viewport <width>x<height>
  --delay-ms <number>       Extra delay after the page is ready.
  --child-limit <number>    Number of direct children to include per node.
  --diff-only               Output only the computed diff object.
  --changed-only            Omit selectors whose diff is null.
  --omit-class-name         Do not include className in snapshots.
  --omit-text               Do not include text excerpts in snapshots.
  --omit-children           Do not include child snapshots.
  --compact                 Shorthand for: --diff-only --changed-only
                            --omit-class-name --omit-text --omit-children
  --output <path>           Write JSON result to a file instead of stdout.
  --help                    Show this help.
`)
}

function parseArgs(argv) {
  const options = {
    selectors: [],
    properties: [],
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    switch (arg) {
      case '--config':
        options.config = argv[++i]
        break
      case '--current-url':
        options.currentUrl = argv[++i]
        break
      case '--baseline-url':
        options.baselineUrl = argv[++i]
        break
      case '--user-agent':
        options.userAgent = argv[++i]
        break
      case '--wait-for':
        options.waitFor = argv[++i]
        break
      case '--selector':
        options.selectors.push(argv[++i])
        break
      case '--property':
        options.properties.push(argv[++i])
        break
      case '--viewport':
        options.viewport = argv[++i]
        break
      case '--delay-ms':
        options.delayMs = Number(argv[++i])
        break
      case '--child-limit':
        options.childLimit = Number(argv[++i])
        break
      case '--diff-only':
        options.diffOnly = true
        break
      case '--changed-only':
        options.changedOnly = true
        break
      case '--omit-class-name':
        options.omitClassName = true
        break
      case '--omit-text':
        options.omitText = true
        break
      case '--omit-children':
        options.omitChildren = true
        break
      case '--compact':
        options.compact = true
        break
      case '--output':
        options.output = argv[++i]
        break
      case '--help':
        options.help = true
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function mergeOptions(base, override) {
  return {
    ...base,
    ...override,
    selectors: override.selectors?.length
      ? override.selectors
      : (base.selectors ?? []),
    properties: override.properties?.length
      ? override.properties
      : (base.properties ?? []),
  }
}

function normalizeOptions(options) {
  const viewportMatch = (options.viewport ?? '1440x1200').match(/^(\d+)x(\d+)$/)
  if (!viewportMatch) {
    throw new Error(`Invalid viewport: ${options.viewport}`)
  }
  if (!options.currentUrl || !options.baselineUrl) {
    throw new Error('Both --current-url and --baseline-url are required')
  }
  if (!options.selectors.length) {
    throw new Error('At least one --selector is required')
  }

  const selectorEntries = options.selectors.map((entry) => {
    const separatorIndex = entry.indexOf('=')
    if (separatorIndex === -1) {
      throw new Error(`Invalid selector entry: ${entry}`)
    }
    return [
      entry.slice(0, separatorIndex),
      entry.slice(separatorIndex + 1),
    ]
  })

  return {
    currentUrl: options.currentUrl,
    baselineUrl: options.baselineUrl,
    userAgent: options.userAgent,
    waitFor: options.waitFor,
    selectorEntries,
    properties: options.properties.length
      ? options.properties
      : DEFAULT_PROPERTIES,
    viewport: {
      width: Number(viewportMatch[1]),
      height: Number(viewportMatch[2]),
    },
    delayMs: Number.isFinite(options.delayMs) ? options.delayMs : 400,
    childLimit:
      options.compact || options.omitChildren
        ? 0
        : Number.isFinite(options.childLimit)
          ? options.childLimit
          : 6,
    includeClassName: !options.compact && !options.omitClassName,
    includeText: !options.compact && !options.omitText,
    includeChildren: !options.compact && !options.omitChildren,
    diffOnly: !!options.diffOnly || !!options.compact,
    changedOnly: !!options.changedOnly || !!options.compact,
    output: options.output,
  }
}

function diffObjects(current, baseline) {
  if (JSON.stringify(current) === JSON.stringify(baseline)) {
    return null
  }

  if (
    current == null ||
    baseline == null ||
    typeof current !== 'object' ||
    typeof baseline !== 'object'
  ) {
    return { current, baseline }
  }

  if (Array.isArray(current) || Array.isArray(baseline)) {
    return { current, baseline }
  }

  const diff = {}
  const keys = new Set([
    ...Object.keys(current ?? {}),
    ...Object.keys(baseline ?? {}),
  ])
  for (const key of keys) {
    const childDiff = diffObjects(current?.[key], baseline?.[key])
    if (childDiff) {
      diff[key] = childDiff
    }
  }
  return Object.keys(diff).length > 0 ? diff : null
}

async function capture(url, options) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: options.viewport,
    userAgent: options.userAgent,
  })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  if (options.waitFor) {
    await page.locator(options.waitFor).first().waitFor({
      state: 'visible',
      timeout: 30_000,
    })
  } else {
    await page.waitForLoadState('networkidle')
  }
  await page.evaluate(async () => {
    if ('fonts' in document) {
      await document.fonts.ready
    }
  })
  if (options.delayMs > 0) {
    await page.waitForTimeout(options.delayMs)
  }

  const result = await page.evaluate(
    ({
      selectorEntries,
      properties,
      childLimit,
      includeClassName,
      includeText,
      includeChildren,
    }) => {
      function round(value) {
        return Math.round(value * 100) / 100
      }

      function snapshot(selector) {
        const node = document.querySelector(selector)
        if (!node) return null
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        const result = {
          tag: node.tagName.toLowerCase(),
          rect: {
            x: round(rect.x),
            y: round(rect.y),
            width: round(rect.width),
            height: round(rect.height),
          },
          styles: Object.fromEntries(
            properties.map((name) => [name, style.getPropertyValue(name)]),
          ),
        }

        if (includeClassName) {
          result.className = node.className
        }
        if (includeText) {
          result.text = node.textContent?.trim().slice(0, 160) ?? ''
        }
        if (includeChildren) {
          result.children = Array.from(node.children)
            .slice(0, childLimit)
            .map((child) => {
              const childStyle = getComputedStyle(child)
              const childRect = child.getBoundingClientRect()
              const childResult = {
                tag: child.tagName.toLowerCase(),
                rect: {
                  x: round(childRect.x),
                  y: round(childRect.y),
                  width: round(childRect.width),
                  height: round(childRect.height),
                },
                styles: Object.fromEntries(
                  properties.map((name) => [name, childStyle.getPropertyValue(name)]),
                ),
              }
              if (includeClassName) {
                childResult.className = child.className
              }
              if (includeText) {
                childResult.text = child.textContent?.trim().slice(0, 120) ?? ''
              }
              return childResult
            })
        }

        return result
      }

      return Object.fromEntries(
        selectorEntries.map(([name, selector]) => [name, snapshot(selector)]),
      )
    },
    {
      selectorEntries: options.selectorEntries,
      properties: options.properties,
      childLimit: options.childLimit,
      includeClassName: options.includeClassName,
      includeText: options.includeText,
      includeChildren: options.includeChildren,
    },
  )

  await context.close()
  await browser.close()
  return result
}

const argvOptions = parseArgs(process.argv.slice(2))
if (argvOptions.help) {
  printHelp()
  process.exit(0)
}

const configOptions = argvOptions.config
  ? JSON.parse(await fs.readFile(argvOptions.config, 'utf8'))
  : {}
const options = normalizeOptions(mergeOptions(configOptions, argvOptions))

const current = await capture(options.currentUrl, options)
const baseline = await capture(options.baselineUrl, options)

const diff = Object.fromEntries(
  Object.keys(current).map((key) => [
    key,
    diffObjects(current[key], baseline[key]),
  ]),
)

const selectedKeys = options.changedOnly
  ? Object.keys(diff).filter((key) => diff[key] !== null)
  : Object.keys(diff)

const outputPayload = options.diffOnly
  ? {
      diff: Object.fromEntries(selectedKeys.map((key) => [key, diff[key]])),
    }
  : {
      current: Object.fromEntries(selectedKeys.map((key) => [key, current[key]])),
      baseline: Object.fromEntries(selectedKeys.map((key) => [key, baseline[key]])),
      diff: Object.fromEntries(selectedKeys.map((key) => [key, diff[key]])),
    }

const output = JSON.stringify(outputPayload, null, 2)

if (options.output) {
  await fs.writeFile(options.output, output)
} else {
  console.log(output)
}
