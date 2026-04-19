import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dive — TideSprint",
  description: "Team-based focus and planning platform with personal ocean ecosystem progression.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ocean-950 text-ocean-50 antialiased">
        {children}
      </body>
    </html>
  );
}
