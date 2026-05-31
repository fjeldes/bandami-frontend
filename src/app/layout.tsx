import "./globals.css";
import { AppInitializer } from "@/components/ui/AppInitializer";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata = {
  title: {
    default: "Bandami — IELTS Preparation",
    template: "%s | Bandami",
  },
  description: "AI-powered IELTS preparation. Practice Writing, Speaking, Reading, and Listening with instant evaluation.",
  keywords: ["IELTS", "AI", "writing", "speaking", "reading", "listening", "band score", "practice", "evaluation"],
  openGraph: {
    title: "Bandami — IELTS Preparation",
    description: "AI-powered IELTS preparation. Practice Writing, Speaking, Reading, and Listening with instant evaluation.",
    type: "website",
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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body text-body-md antialiased min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold">Skip to main content</a>
        <AppInitializer>
          <ToastContainer>{children}</ToastContainer>
        </AppInitializer>
      </body>
    </html>
  );
}
