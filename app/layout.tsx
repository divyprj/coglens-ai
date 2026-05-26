import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { VerificationProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CogLens — Document Verification",
    template: "%s | CogLens",
  },
  description:
    "AI-powered document verification and fact-checking. Upload any document and get a comprehensive trust score with source-backed evidence.",
  keywords: [
    "document verification",
    "fact checking",
    "AI verification",
    "trust score",
    "source analysis",
  ],
  authors: [{ name: "CogLens" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CogLens",
    title: "CogLens — Document Verification",
    description:
      "AI-powered document verification and fact-checking with source-backed evidence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CogLens — Document Verification",
    description:
      "AI-powered document verification and fact-checking with source-backed evidence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <VerificationProvider>{children}</VerificationProvider>
      </body>
    </html>
  );
}
