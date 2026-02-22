import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({ weight: ["400"], subsets: ["latin"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: 'specmap - AQA Physics',
  description: 'Track your A-level Physics revision progress across the full AQA specification',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased`}>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-FNCD9XSJS5" />
        <Script id="google-analytics">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
            
                gtag('config', 'G-FNCD9XSJS5');
            `}
        </Script>
      </body>
    </html>
  )
}
