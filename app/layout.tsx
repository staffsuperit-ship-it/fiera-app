import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Fiera App - Gestione Contatti',
  description: 'App per acquisizione lead in fiera',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-gray-50 flex flex-col min-h-screen">
        {/* NAV BAR */}
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <Link href="/" className="font-black text-xl text-gray-800 italic">
              FIERA<span className="text-blue-600">APP</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/" className="text-sm font-bold text-gray-600">📝 Form</Link>
              <Link href="/dashboard" className="text-sm font-bold text-gray-600">📊 Report</Link>
              <Link href="/admin" className="text-sm font-bold text-gray-600">⚙️ Admin</Link>
            </div>
          </div>
        </nav>

        {/* CONTENUTO */}
        <div className="flex-grow pt-4">
          {children}
        </div>

        {/* FOOTER FIRMA @VINTAGE */}
        <footer className="py-6 mt-auto text-center border-t bg-white">
          <p className="text-xs text-gray-400 font-medium mb-2">@Vintage di Gloria Natangelo</p>
          <div className="flex justify-center gap-6">
            <a href="tel:+393934533500" title="Chiama">📞</a>
            <a href="https://wa.me/393934533500" target="_blank" title="WhatsApp">💬</a>
            <a href="https://www.graficapubblicita.com" target="_blank" title="Sito Web">🌐</a>
          </div>
        </footer>
      </body>
    </html>
  )
}