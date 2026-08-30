import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EmberProvider } from "@/context/ember-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disciplr — Growth Network",
  description:
    "A Growth Network for building daily habits inside small, trusted Pods (3–8 people) with 1-tap check-in, lightweight proof, and forgiving streak shields.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090a0f] text-[#f4f4f7]">
        <EmberProvider>{children}</EmberProvider>
      </body>
    </html>
  );
}
