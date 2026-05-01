import type { Metadata } from 'next'
import styles from '../DocsPage.module.css'
import cardStyles from '@/components/ArticleCard.module.css'
import richTextStyles from '@/components/RichText.module.css'
import surfaceStyles from '@/components/Surface.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage(
  props: PageProps<'/[lang]/privacy-policy'>,
) {
  return (
    <article
      className={`${surfaceStyles.cardSurface} ${cardStyles.card} ${richTextStyles.richText} ${styles.article}`}
    >
      <h1>Privacy Policy</h1>
      <p>Last updated: 2026-05-01</p>

      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains how we collect, use, and protect
          information when you use Mojidata Web App. The production site is
          served from <code>mojidata.ryusei.dev</code> on Cloudflare Workers and
          uses Cloudflare services for hosting, DNS, TLS, caching, R2 object
          storage, D1-backed API access, security, and operational monitoring.
        </p>
        <p>
          Mojidata Web App is a public database browsing and search service. It
          does not provide user accounts, user profile pages, paid features, or
          contact forms.
        </p>
      </section>

      <section>
        <h2>2. Information We Process</h2>

        <h3>2.1 Request and delivery data</h3>
        <p>
          When you access the site, Cloudflare and the application may process
          technical request data needed to deliver the service and protect it
          from abuse. This can include:
        </p>
        <ul>
          <li>Requested URL, route, query string, and HTTP method</li>
          <li>Response status, timestamp, and cache metadata</li>
          <li>IP address and approximate location derived from the IP address</li>
          <li>Browser, operating system, device type, and User-Agent</li>
          <li>Request headers needed for content negotiation and security</li>
          <li>Network and security signals used to detect abusive traffic</li>
        </ul>

        <h3>2.2 Search and lookup data</h3>
        <p>
          Search terms, IDS lookup strings, character routes, and related query
          parameters are processed by the app Worker and the D1-backed API
          Worker to return search results and character information. We do not
          use these inputs to identify users, build marketing profiles, or serve
          targeted advertising.
        </p>

        <h3>2.3 Browser storage</h3>
        <p>
          The production site does not use cookies for advertising or
          cross-site tracking. A preview-only warning may store a small
          `localStorage` value to remember that you dismissed the preview
          notice on a non-production hostname. Your browser may also cache
          static assets such as fonts, WebAssembly, database files, and SVG
          images according to normal browser caching behavior.
        </p>
      </section>

      <section>
        <h2>3. Cloudflare Services</h2>
        <p>
          The production site uses Cloudflare Workers to execute the app,
          Cloudflare R2 to store public static assets and Worker cache data, and
          a separate D1-backed API Worker to serve public Mojidata database
          queries. Cloudflare DNS, TLS, CDN, DDoS protection, firewall, logs,
          and analytics dashboards may process request metadata as part of
          operating and securing the service.
        </p>
        <p>
          Cloudflare may make request logs, security events, and aggregate
          network metrics available to us through Cloudflare dashboards or APIs.
          We use this information for operations, debugging, performance
          analysis, abuse prevention, and security response.
        </p>
        <p>
          The data stored in R2 and D1 for this app consists of public
          application data, public character database assets, precomputed glyph
          path assets, and cache data. The app does not store user-submitted
          account data in R2 or D1.
        </p>
      </section>

      <section>
        <h2>4. Analytics</h2>
        <p>
          The Cloudflare production deployment does not currently enable
          third-party client-side analytics tooling. If analytics tooling is
          enabled later, this policy should be updated before or at the same
          time as that change.
        </p>
        <p>
          Cloudflare may still provide aggregate traffic, performance, cache,
          and security metrics derived from normal request processing. We use
          those aggregate metrics to operate and improve the service.
        </p>
      </section>

      <section>
        <h2>5. How We Use Information</h2>
        <p>We use the information described above to:</p>
        <ul>
          <li>Deliver pages, search results, glyph images, and static assets</li>
          <li>Operate the D1-backed API Worker and app Worker</li>
          <li>Debug errors and monitor service health</li>
          <li>Improve performance, reliability, and user experience</li>
          <li>Detect, prevent, and respond to abuse or security incidents</li>
          <li>Comply with legal obligations when applicable</li>
        </ul>
        <p>
          We do not sell personal information, share personal information for
          cross-context behavioral advertising, or use request logs to build
          marketing profiles.
        </p>
      </section>

      <section>
        <h2>6. Legal Basis</h2>
        <p>
          For visitors in the European Economic Area (EEA), processing needed to
          deliver requested pages and search results is necessary to provide the
          service you request. Processing for security, debugging, reliability,
          and aggregate performance analysis is based on our legitimate interest
          in operating and protecting the website and infrastructure.
        </p>
      </section>

      <section>
        <h2>7. International Data Transfers</h2>
        <p>
          Cloudflare operates a global network. Technical request data and
          operational logs may be processed in countries other than your own,
          including outside the European Economic Area. Cloudflare describes its
          transfer safeguards and privacy practices in its own privacy
          documentation.
        </p>
      </section>

      <section>
        <h2>8. Your Rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, restrict, or object to certain processing of your personal
          data. Because Mojidata Web App does not provide user accounts and does
          not intentionally store user profile data, these rights are most
          likely to relate to technical request logs or information you provide
          directly when contacting us.
        </p>
        <p>
          California residents may have rights to know, delete, correct, or opt
          out of certain uses of personal information. We do not sell or share
          personal information for targeted advertising.
        </p>
      </section>

      <section>
        <h2>9. External Documentation</h2>
        <p>
          For more information about Cloudflare&apos;s data handling practices,
          please refer to Cloudflare&apos;s documentation and legal notices:
        </p>
        <ul>
          <li>
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              rel="noopener noreferrer"
            >
              Cloudflare Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="https://developers.cloudflare.com/workers/configuration/routing/custom-domains/"
              rel="noopener noreferrer"
            >
              Cloudflare Workers Custom Domains
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          If you have any questions about this Privacy Policy or how we handle
          data, you can contact us at:
        </p>
        <p>mandel59@gmail.com</p>
      </section>
    </article>
  )
}
