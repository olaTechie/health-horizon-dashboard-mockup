import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter, jetbrains } from './fonts';

export const metadata: Metadata = {
  title: "Shell Health Horizon Dashboard",
  description: "Shell Health Horizon Scanning Executive Intelligence Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
