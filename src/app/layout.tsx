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
  description: "Your command center",
};

const navItems = [
  { label: "📊 Dashboard", href: "/" },
  { label: "🤖 Agents", href: "/agents" },
  { label: "✅ Tasks", href: "/tasks" },
  { label: "🎯 Missions", href: "/missions" },
  { label: "🛠️ Tools", href: "/tools" },
  { label: "⚙️ Settings", href: "/settings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex bg-[#0d1117] text-gray-300 selection:bg-cyan-500/30`}>
        {/* Sidebar - GitHub Dark Style */}
        <nav className="w-64 min-h-screen border-r border-[#30363d] flex flex-col py-6 px-4 shrink-0 bg-[#161b22]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-xl">🚀</span>
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">
                Mission
              </span>
              <span className="font-bold text-lg text-cyan-400">Control</span>
            </div>
          </div>
          
          {/* Navigation */}
          <ul className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-[#21262d] hover:text-white text-gray-400 border border-transparent hover:border-[#30363d]"
                >
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {item.label.split(' ')[0]}
                  </span>
                  <span>{item.label.split(' ').slice(1).join(' ')}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Status Footer */}
          <div className="mt-auto px-4 py-4 border-t border-[#30363d]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">v1.0.0</div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0d1117]">
          {/* Top Bar */}
          <div className="border-b border-[#30363d] px-8 py-4 bg-[#161b22]/50 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-[#21262d] border border-[#30363d] text-xs text-gray-400">
                Jarvis AI Agent
              </div>
              <div className="text-sm text-gray-500">|</div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-sm text-gray-300 transition-colors">
                ➕ New Task
              </button>
              <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors shadow-lg shadow-cyan-600/20">
                🚀 New Mission
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
