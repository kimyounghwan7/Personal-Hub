import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Hub",
  description: "Personal Portfolio & Productivity Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between">
            <div className="font-bold text-xl">Personal Hub</div>
            <div className="flex gap-4">
              <a href="/" className="hover:text-gray-300">About Me</a>
              <a href="/todos" className="hover:text-gray-300">Todos</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
