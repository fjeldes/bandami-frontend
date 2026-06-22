import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppInitializer } from "@/components/ui/AppInitializer";
import { ToastContainer } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";
import FeedbackButton from "@/components/ui/FeedbackButton";
import QueryProvider from "@/components/ui/QueryProvider";
import { ThemeProvider } from "@/hooks/useTheme";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bandami.com"),
  title: {
    default: "Bandami — IELTS Preparation",
    template: "%s | Bandami",
  },
  description: "IELTS preparation with detailed feedback and personalized study guidance. Practice Writing, Speaking, Reading, and Listening with instant band scores.",
  keywords: ["IELTS", "writing", "speaking", "reading", "listening", "band score", "practice", "evaluation", "study", "feedback"],
  openGraph: {
    title: "Bandami — IELTS Preparation",
    description: "AI-powered IELTS preparation. Practice Writing, Speaking, Reading, and Listening with instant evaluation.",
    type: "website",
    url: "/",
    siteName: "Bandami",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bandami — IELTS Preparation",
    description: "IELTS preparation with detailed feedback and personalized study guidance. Practice Writing, Speaking, Reading, and Listening with instant band scores.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/bandami.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} style={{ fontFamily: "var(--font-inter)" }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body text-body-md antialiased min-h-screen">
        <ThemeProvider>
        <QueryProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold">Skip to main content</a>
        <FeedbackButton />
        <AppInitializer>
          <ToastContainer>{children}</ToastContainer>
        </AppInitializer>
        <CookieConsent />
        </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
