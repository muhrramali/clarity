import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarity — Plain Language Rewriter",
  description:
    "Paste dense or technical text and get a plain-language rewrite, a readability score, and a list of jargon replaced with simpler alternatives.",
  keywords: [
    "plain language",
    "readability",
    "AI rewriter",
    "jargon",
    "accessibility",
    "Next.js",
  ],
  authors: [{ name: "Clarity" }],
  openGraph: {
    title: "Clarity — Plain Language Rewriter",
    description:
      "AI-powered plain-language rewriter with readability scores and jargon detection.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Clarity — Plain Language Rewriter",
    description:
      "AI-powered plain-language rewriter with readability scores and jargon detection.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
