import { useSyncExternalStore } from 'react'

const navigationEvent = 'mojidata-crawl:navigation'

function dispatchNavigationEvent() {
  window.dispatchEvent(new Event(navigationEvent))
}

function ensureHistoryPatch() {
  const historyWithPatch = window.history as History & {
    __mojidataCrawlPatched?: boolean
  }
  if (historyWithPatch.__mojidataCrawlPatched) return
  historyWithPatch.__mojidataCrawlPatched = true

  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method]
    window.history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args)
      dispatchNavigationEvent()
      return result
    }
  }

  window.addEventListener('popstate', dispatchNavigationEvent)
}

function getSnapshot() {
  ensureHistoryPatch()
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function subscribe(onStoreChange: () => void) {
  ensureHistoryPatch()
  window.addEventListener(navigationEvent, onStoreChange)
  return () => {
    window.removeEventListener(navigationEvent, onStoreChange)
  }
}

export function useLocationSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, () => '/')
}

function toLocalPath(href: string) {
  const url = new URL(href, window.location.href)
  return `${url.pathname}${url.search}${url.hash}`
}

export function navigate(
  href: string,
  options: { replace?: boolean; scroll?: boolean } = {},
) {
  const localPath = toLocalPath(href)
  if (options.replace) {
    window.history.replaceState(window.history.state, '', localPath)
  } else {
    window.history.pushState(window.history.state, '', localPath)
  }
  if (options.scroll !== false) {
    window.scrollTo({ top: 0, left: 0 })
  }
}

export function usePathname() {
  const snapshot = useLocationSnapshot()
  return new URL(snapshot, window.location.origin).pathname
}

export function useSearchParams() {
  const snapshot = useLocationSnapshot()
  return new URL(snapshot, window.location.origin).searchParams
}

export function useRouter() {
  return {
    push: (href: string, options?: { scroll?: boolean }) =>
      navigate(href, options),
    replace: (href: string, options?: { scroll?: boolean }) =>
      navigate(href, { ...options, replace: true }),
    refresh: () => dispatchNavigationEvent(),
    prefetch: async () => {},
  }
}
