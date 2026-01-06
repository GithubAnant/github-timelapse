import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Timelapse Generator | Visualize Your Contribution Journey",
  description: "Generate beautiful timelapse videos of your GitHub contribution chart. Watch your coding journey unfold day by day.",
  keywords: ["GitHub", "timelapse", "contributions", "developer", "coding", "visualization"],
  authors: [{ name: "GitHub Timelapse" }],
  openGraph: {
    title: "GitHub Timelapse Generator",
    description: "Generate beautiful timelapse videos of your GitHub contribution chart",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitHub Timelapse Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Timelapse Generator",
    description: "Generate beautiful timelapse videos of your GitHub contribution chart",
    images: ["/og-image.png"],
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
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
