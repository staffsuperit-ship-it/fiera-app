import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Fiera App - Gestione Contatti',
  description: 'App per acquisizione lead in fiera',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="bg-gray-50">
        {/* NAV BAR FISSA IN ALTO */}
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo / Nome App */}
              <Link href="/" className="font-black text-xl tracking-tight text-gray-800">
                FIERA<span className="text-blue-600">APP</span>
              </Link>

              {/* Link rapidi */}
              <div className="flex gap-4 md:gap-8">
                <Link href="/" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                  📝 Form
                </Link>
                <Link href="/dashboard" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                  📊 Report
                </Link>
                <Link href="/admin" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                  ⚙️ Admin
                </Link>
              </div>

            </div>
          </div>
        </nav>

        {/* CONTENUTO DELLE PAGINE */}
        <div className="pt-4">
          {children}
        </div>
      </body>
    </html>
  )
}