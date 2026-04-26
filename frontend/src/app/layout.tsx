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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-[#0a0a0f] text-white antialiased`}>
        {/* Glassmorphism Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/60 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="font-extrabold text-xl tracking-tight text-white hover:text-blue-400 transition-colors">
              Personal<span className="text-blue-500">Hub</span>
            </a>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="/todos" className="text-gray-300 hover:text-white transition-colors">Calendar</a>
              <a href="/admin" className="text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20">Admin Panel</a>
            </div>
          </div>
        </nav>
        
        {/* Main Content (No top padding so hero goes behind navbar) */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
