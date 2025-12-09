// app/privacy/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export interface PrivacyPageProps {
  params: { lang: string }
}

export default function PrivacyPage(props: PrivacyPageProps) {
  return (
    <main className="container">
      <article>
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <section>
          <h2>1. Overview</h2>
          <p>
            This page explains how we handle data on this website, including our
            use of Vercel Speed Insights and Vercel Analytics.
          </p>
        </section>

        <section>
          <h2>2. Use of Vercel Speed Insights &amp; Vercel Web Analytics</h2>

          <div>
            <p>
              We use Vercel Speed Insights and Vercel Web Analytics to collect
              anonymized performance and usage data for improving our website.
              No personal data is collected, stored, sold, or shared through
              these services.
            </p>

            <p>
              The data processed via these tools is limited to technical and
              aggregated information such as page load times, device and browser
              types, and interaction metrics. This information cannot be used to
              identify an individual user.
            </p>

            <h3>2.1 Legal Basis under GDPR</h3>
            <p>
              Under the General Data Protection Regulation (GDPR), the
              processing of anonymized technical data via Vercel Speed Insights
              and Vercel Analytics is based on our legitimate interest in
              maintaining and improving the performance, security, and usability
              of our website (Article 6(1)(f) GDPR). Because this data does not
              identify individual users, explicit consent is not required.
            </p>

            <h3>2.2 CCPA Compliance (California)</h3>
            <p>
              In accordance with the California Consumer Privacy Act (CCPA), we
              confirm that we do not sell or share personal information through
              Vercel Speed Insights or Vercel Analytics. As these tools do not
              process personal information, the rights related to the sale of
              personal information are not applicable in this context.
            </p>

            <p>
              We use the collected anonymized data solely for performance
              monitoring, statistical analysis, and service improvement. It is
              not used for profiling, targeted advertising, or cross-site
              tracking.
            </p>
          </div>
        </section>

        <section>
          <h2>3. Information Handling by Vercel Services</h2>

          <p>
            For details on how Vercel handles analytics and performance data,
            please refer to the official documentation below:
          </p>

          <ul>
            <li>
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                rel="noopener noreferrer"
              >
                Vercel Analytics – Privacy & Data Handling
              </a>
            </li>
            <li>
              <a
                href="https://vercel.com/docs/speed-insights/privacy-policy"
                rel="noopener noreferrer"
              >
                Vercel Speed Insights – Privacy & Data Handling
              </a>
            </li>
          </ul>

          <p>
            These links provide the most up-to-date and authoritative
            information about how analytics and performance data are processed
            by Vercel.
          </p>
        </section>

        <section>
          <h2>4. Contact</h2>
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
