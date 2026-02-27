import type { Metadata } from "next";
import { Space_Grotesk, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { GlobalHeader } from "@/components/global-header";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const body = Fraunces({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "CloudChef",
  description: "Multi-user recipe manager with AI helpers and sharing.",
  icons: {
    icon: "/cloudchef-logo.svg",
    shortcut: "/cloudchef-logo.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} app-grid bg-background antialiased`}>
        <div className="min-h-screen">
          <GlobalHeader />
          {children}
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
