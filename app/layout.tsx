import { Suspense } from 'react';
import type { Metadata } from 'next';
import { fraunces, inter, jetbrains } from './fonts';
import './globals.css';
import { SideRail } from '@/components/nav/SideRail';
import { GlobalFilters } from '@/components/nav/GlobalFilters';
import { Footer } from '@/components/nav/Footer';

export const metadata: Metadata = {
  title: 'Shell Health Horizon — Executive Intelligence',
  description: 'Illustrative prototype dashboard for the Shell Health Horizon Scanning programme.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="editorial"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('shh-theme');if(t==='ops'||t==='editorial')document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
        {/* Console signature — for technical evaluators who open DevTools.
            Discreet, not promotional; restates the methodology and points
            to the source so anyone curious can read the architecture. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s='font-family:ui-monospace,monospace;line-height:1.5';console.log('%cShell Health Horizon — Executive Intelligence (illustrative prototype)\\n%cAI-Augmented Living Intelligence Architecture\\n5 agents \\u2192 NLP signal detection \\u2192 tiered alerts \\u2192 PPA-tagged actions\\n\\nAll signals are real-event-grounded mock data. Not vendor-validated.\\nSource: https://github.com/olaTechie/health-horizon-dashboard-mockup','font-family:ui-serif,Georgia,serif;font-size:14px;font-weight:600;color:#B23A3A',s);}catch(e){}`,
          }}
        />
      </head>
      <body>
        <SideRail />
        <Suspense fallback={null}><GlobalFilters /></Suspense>
        <main className="ml-[180px] min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
