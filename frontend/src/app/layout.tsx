import type { Metadata } from "next";
import { RootProviders } from "@/components/layout/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FCS Nigeria - Registration & Attendance System",
  description:
    "Digital registration, event management, and attendance tracking for FCS Nigeria.",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["FCS", "registration", "attendance", "event-management", "church"],
  authors: [{ name: "FCS Development Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#010030" />
      </head>
      <body>
        <RootProviders>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
