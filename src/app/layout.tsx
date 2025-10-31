import type { Metadata } from 'next'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'PlannerTours - Cotizaciones de Transporte',
  description: 'Sistema moderno de cotización de transporte para empresas turísticas',
  keywords: ['transporte', 'cotización', 'turismo', 'Honduras'],
  authors: [{ name: 'PlannerTours' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set initial theme to prevent flash - default to dark mode
              const savedTheme = localStorage.getItem('theme');
              const theme = savedTheme || 'business';
              document.documentElement.setAttribute('data-theme', theme);

              // Also set dark class for Tailwind CSS
              if (theme === 'business') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}