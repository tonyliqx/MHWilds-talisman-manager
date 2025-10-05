import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MH Wilds Talisman Manager',
  description: 'Manage your Monster Hunter Wilds talismans with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen">
          <header className="bg-amber-900 text-yellow-300 py-4 px-6 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold">🛡️ MH Wilds Talisman Manager</h1>
              <p className="text-amber-100 mt-2">Manage your talisman collection for Monster Hunter Wilds</p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </main>
          <footer className="bg-amber-900 text-amber-100 py-4 px-6 mt-12">
            <div className="max-w-7xl mx-auto text-center">
              <p>© 2024 MH Wilds Talisman Manager - Inspired by <a href="https://mhwilds.wiki-db.com/sim/" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">MH Wilds Skill Simulator</a></p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
