import type { Metadata } from "next";
import Script from "next/script";
import { Hanken_Grotesk, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "SealedVerdict",
  description:
    "Commit-reveal bounties judged by AI on Ritual chain. Answers stay sealed until the deadline; Ritual AI ranks revealed submissions; the owner enters judgment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${hanken.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-bg text-fg">
        <Script id="sv-theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('sv-theme')==='light')document.documentElement.classList.add('light')}catch(e){}`}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
