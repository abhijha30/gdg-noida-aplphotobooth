import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I Am GDG Noida 🎽 Photo Booth",
  description: "Take a selfie wearing the GDG Noida jersey and share it on Instagram! #IAmGDGNoida",
  keywords: ["GDG Noida", "Google Developer Groups", "Photo Booth", "Dev Fest"],
  openGraph: {
    title: "I Am GDG Noida 🎽 Photo Booth",
    description: "Take a selfie wearing the GDG Noida jersey!",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GDG Photo Booth",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
