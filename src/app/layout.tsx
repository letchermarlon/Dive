import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

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
    <ClerkProvider>
      <html lang="en" className={figtree.variable}>
        <body className="min-h-screen bg-background text-foreground antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
