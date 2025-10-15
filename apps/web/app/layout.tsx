import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import "@jn7denews9kmfhbt1yqqp2ts817sgsqe/components/styles.css";
import "@jn7denews9kmfhbt1yqqp2ts817sgsqe/design-tokens/src/theme.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TaskFlow - Modern Todo List",
  description: "A production-ready todo list application with Convex backend",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
