import { useState } from 'react'
import Sidebar from './Sidebar'

function MainLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const closeMobileMenu = () => {
    setIsMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <Sidebar
        isOpen={isMobileOpen}
        onClose={closeMobileMenu}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
