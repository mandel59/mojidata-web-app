'use client'

import { useEffect, useState } from 'react'

export interface MojidataSectionNavSection {
  id: string
  label: string
}

export interface MojidataSectionNavProps {
  sections: MojidataSectionNavSection[]
  anchorKey: string
}

export default function MojidataSectionNav(props: MojidataSectionNavProps) {
  const { sections, anchorKey } = props
  const [activeSectionId, setActiveSectionId] = useState('Character_Data')

  useEffect(() => {
    const updateActive = () => {
      const els = sections
        .map(({ id }) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el))
      if (els.length === 0) return

      const topOffset = 140
      const current =
        els.filter((el) => el.getBoundingClientRect().top <= topOffset).at(-1) ??
        els[0]
      if (current?.id) setActiveSectionId(current.id)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    window.addEventListener('hashchange', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
      window.removeEventListener('hashchange', updateActive)
    }
  }, [sections])

  useEffect(() => {
    const scrollToHashAnchor = () => {
      const rawHash = window.location.hash
      if (!rawHash || rawHash.length <= 1) return
      const id = decodeURIComponent(rawHash.slice(1))
      const target = document.getElementById(id)
      if (!target) return
      target.scrollIntoView({ block: 'start' })
    }

    const raf1 = window.requestAnimationFrame(() => {
      const raf2 = window.requestAnimationFrame(scrollToHashAnchor)
      window.setTimeout(scrollToHashAnchor, 120)
      return raf2
    })

    window.addEventListener('hashchange', scrollToHashAnchor)
    return () => {
      window.cancelAnimationFrame(raf1)
      window.removeEventListener('hashchange', scrollToHashAnchor)
    }
  }, [anchorKey])

  const links = sections.map((section) => (
    <a
      key={section.id}
      href={`#${section.id}`}
      className={section.id === activeSectionId ? 'is-active' : undefined}
    >
      {section.label}
    </a>
  ))

  return (
    <>
      <nav
        className="mojidata-section-nav mojidata-section-nav-mobile"
        aria-label="Mojidata sections"
      >
        {links}
      </nav>
      <aside className="mojidata-toc-sidebar" aria-label="Mojidata table of contents">
        <nav
          className="mojidata-section-nav mojidata-section-nav-sidebar"
          aria-label="Mojidata sections"
        >
          {links}
        </nav>
      </aside>
    </>
  )
}
