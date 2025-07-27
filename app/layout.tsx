import type { Metadata } from "next";
import "./globals.css";
import { labels } from "@/constants/text";

export const metadata: Metadata = {
  title: labels.APP_TITLE,
  description: labels.APP_DESCRIPTION,
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">{children}</body>
    </html>
  );
}
