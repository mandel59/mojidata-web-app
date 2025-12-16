// app/privacy/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export interface PrivacyPageProps {
  params: Promise<{ lang: string }>
}

export default function PrivacyPage(props: PrivacyPageProps) {
  return (
    <main className="container">
      <article>
        <h1>Privacy Policy</h1>
        <p>Last updated: 2025-12-09</p>

        <section>
          <h2>1. Overview</h2>
          <p>
            This Privacy Policy explains how we collect, use, and protect
            information when you use our website. Our site is hosted on Vercel
            and uses Vercel Web Analytics, Vercel Speed Insights, and Vercel
            Firewall and related security features.
          </p>
          <p>
            We aim to respect your privacy while still monitoring performance
            and protecting our service from abuse.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect and Process</h2>

          <h3>2.1 Data collected automatically through Vercel services</h3>
          <p>
            When you access our website, certain technical information is
            automatically processed by Vercel to deliver and monitor the
            service. Depending on your configuration and plan, this may include:
          </p>
          <ul>
            <li>Requested URL and route</li>
            <li>Browser type and version</li>
            <li>Device type (desktop, tablet, mobile) and operating system</li>
            <li>Network information such as connection speed</li>
            <li>Approximate location at country level</li>
            <li>
              Performance metrics such as page load times and Core Web Vitals
            </li>
          </ul>
          <p>
            For Web Analytics and Speed Insights, this information is processed
            in an anonymized or aggregated way and is not used to reconstruct
            individual browsing histories or identify specific users.
          </p>

          <h3>2.2 Security-related processing (Firewall, logs, monitoring)</h3>
          <p>
            To protect our service against attacks, abuse, and unauthorized
            access, we use Vercel Firewall and other security-related features.
            For this purpose, Vercel may process additional data such as:
          </p>
          <ul>
            <li>IP address (original or forwarded)</li>
            <li>Coarse geolocation derived from the IP address</li>
            <li>User-Agent and other request headers</li>
            <li>
              Request patterns and metadata associated with potential threats
            </li>
            <li>
              Technical fingerprints (for example, TLS fingerprints) used to
              identify malicious sessions
            </li>
          </ul>
          <p>
            This data is used solely for security, debugging, and operational
            purposes and is processed by Vercel in accordance with their own
            privacy and security policies.
          </p>
        </section>

        <section>
          <h2>3. Use of Vercel Web Analytics and Vercel Speed Insights</h2>

          <h3>3.1 Purpose</h3>
          <p>
            We use Vercel Web Analytics and Vercel Speed Insights to understand
            how our website is performing and how it is used in aggregate. This
            helps us improve page speed, stability, and overall user experience.
          </p>

          <h3>3.2 Data characteristics</h3>
          <p>
            According to Vercel&apos;s documentation, Web Analytics and Speed
            Insights are designed to provide insights without using third-party
            cookies and without collecting or storing information that would
            allow the reconstruction of an end user&apos;s browsing session
            across different websites or the identification of an individual
            visitor.
          </p>
          <p>
            Data points are stored in an anonymized or aggregated manner and are
            used to compute statistics such as page views, routes accessed,
            device-type breakdowns, and performance metrics. We do not use these
            tools to track users across different sites, to profile individuals,
            or for targeted advertising.
          </p>

          <h3>3.3 Legal basis under GDPR</h3>
          <p>
            For visitors in the European Economic Area (EEA), the processing of
            anonymized and aggregated analytics data is based on our legitimate
            interest in maintaining and improving the performance, security, and
            usability of our website (Article 6(1)(f) GDPR). Because Web
            Analytics and Speed Insights are designed not to collect personally
            identifiable information, explicit consent is generally not required
            for this processing.
          </p>

          <h3>3.4 CCPA considerations</h3>
          <p>
            For visitors from California (USA), we do not use Vercel Web
            Analytics or Speed Insights to collect, sell, or share personal
            information as defined under the California Consumer Privacy Act
            (CCPA). The data is used solely to create aggregate statistics about
            how our site is used.
          </p>
        </section>

        <section>
          <h2>4. Vercel Firewall and Security Features</h2>

          <h3>4.1 Purpose</h3>
          <p>
            We enable Vercel&apos;s Firewall and related security features to
            protect our site from malicious traffic, spam, abuse, and
            unauthorized access attempts. This includes, for example, rate
            limiting, IP blocking, and rule-based detection of suspicious
            patterns.
          </p>

          <h3>4.2 Data processed for security</h3>
          <p>
            In order to provide these protections, Vercel may process and log:
          </p>
          <ul>
            <li>
              Source IP addresses and ranges (for example, for IP blocking)
            </li>
            <li>Country or region derived from the IP address</li>
            <li>
              Request metadata such as HTTP method, path, status code, and time
            </li>
            <li>
              Technical fingerprints or identifiers used to distinguish
              legitimate from malicious sessions
            </li>
          </ul>
          <p>
            This information may appear in Vercel&apos;s firewall dashboards,
            logs or alerts so that we can identify and respond to potential
            threats.
          </p>

          <h3>4.3 Legal basis under GDPR</h3>
          <p>
            The processing of IP addresses and related request data for security
            purposes is based on our legitimate interest in ensuring the
            security and integrity of our website and infrastructure (Article
            6(1)(f) GDPR). This includes detecting and mitigating attacks such
            as distributed denial-of-service (DDoS) attacks, scanning, or other
            forms of abuse.
          </p>

          <h3>4.4 Limited use</h3>
          <p>
            We do not use Firewall or security logs to build marketing profiles,
            to track ordinary users for behavioral advertising, or to otherwise
            evaluate individuals beyond what is necessary for security and
            operational troubleshooting.
          </p>
        </section>

        <section>
          <h2>5. International Data Transfers</h2>
          <p>
            Our site is hosted on Vercel, which may process data on servers
            located in various regions, including outside your country or
            outside the European Economic Area (EEA). Vercel states that it
            implements appropriate technical and organizational measures to
            protect personal data and comply with applicable data protection
            laws.
          </p>
          <p>
            By using our site, you acknowledge that such processing and
            transfers may occur as part of providing the hosting and analytics
            services.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>

          <h3>6.1 GDPR rights (EEA users)</h3>
          <p>
            If you are located in the EEA, you may have certain rights regarding
            your personal data under the GDPR, including:
          </p>
          <ul>
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure (where applicable)</li>
            <li>Right to restriction of processing</li>
            <li>Right to object to processing based on legitimate interests</li>
            <li>Right to data portability (where applicable)</li>
          </ul>
          <p>
            Because our use of Vercel Web Analytics and Speed Insights is
            designed not to collect personally identifiable information, these
            rights are typically most relevant for data you provide directly
            (for example, via contact forms) or for security-related logs that
            may include your IP address.
          </p>

          <h3>6.2 CCPA rights (California users)</h3>
          <p>
            If you are a California resident, you may have rights under the
            CCPA, including:
          </p>
          <ul>
            <li>
              Right to know what categories of personal information are used
            </li>
            <li>Right to request deletion of your personal information</li>
            <li>
              Right to opt out of the sale or sharing of personal information
              (where applicable)
            </li>
            <li>
              Right not to be discriminated against for exercising your rights
            </li>
          </ul>
          <p>
            We do not sell or share personal information obtained through Vercel
            Web Analytics or Speed Insights. Any personal information processed
            for security purposes (such as IP addresses) is used solely to
            protect the service.
          </p>
        </section>

        <section>
          <h2>7. Links to Vercel&apos;s Privacy and Security Documentation</h2>
          <p>
            For the most accurate and up-to-date information on how Vercel
            processes data, please refer to Vercel&apos;s own documentation and
            legal notices:
          </p>
          <ul>
            <li>
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                rel="noopener noreferrer"
              >
                Vercel Web Analytics – Privacy &amp; Compliance
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/speed-insights/privacy-policy"
                rel="noopener noreferrer"
              >
                Vercel Speed Insights – Privacy &amp; Compliance
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/vercel-firewall"
                rel="noopener noreferrer"
              >
                Vercel Firewall – Documentation
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/legal/privacy-policy"
                rel="noopener noreferrer"
              >
                Vercel – Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy or how we handle
            data, you can contact us at:
          </p>
          <p>mandel59@gmail.com</p>
        </section>
      </article>
    </main>
  )
}
