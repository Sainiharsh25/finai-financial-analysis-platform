import Sidebar from './Sidebar'

function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default MainLayout