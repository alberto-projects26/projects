import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Your team's local command center",
};

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Tasks", href: "/tasks" },
  { label: "Missions", href: "/missions" },
  { label: "Tools", href: "/tools" },
  { label: "Settings", href: "/settings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex bg-[#0a0a0a] text-gray-100`}>
        {/* Sidebar */}
        <nav className="w-64 border-r border-gray-800 flex flex-col py-6 px-4 shrink-0 bg-[#0f0f0f]">
          <div className="flex items-center gap-3 mb-10 px-2">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-xl tracking-tight text-cyan-400">
              Control
            </span>
          </div>
          
          <ul className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-gray-800/50 hover:text-cyan-400 text-gray-400"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-auto px-4 py-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 font-mono">
              SYSTEM ONLINE
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
