import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checkers",
  description: "Checkers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background">{children}</body>
    </html>
  );
}
