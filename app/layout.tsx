import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { JiraProvider } from "./context/JiraContext";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taskflow — Project Management",
  description: "A refined project and task management experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] dark:bg-[#0f172a] text-[#1A1A1A] dark:text-[#E8E6E3]">
    <ClerkProvider>
      <JiraProvider>{children}</JiraProvider>
    </ClerkProvider>
      </body>
    </html>
  );
}
