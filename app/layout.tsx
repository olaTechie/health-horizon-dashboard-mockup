import type { Metadata } from 'next';
import { fraunces, inter, jetbrains } from './fonts';
import './globals.css';

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
      </head>
      <body>{children}</body>
    </html>
  );
}
