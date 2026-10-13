import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import FinanceLearning from './pages/FinanceLearning/FinanceLearning'
import Dashboard from './pages/Dashboard/Dashboard'
import StockAnalysis from './pages/StockAnalysis/StockAnalysis'
import Strategies from './pages/Strategies/Strategies'
import Backtesting from './pages/Backtesting/Backtesting'
import Portfolio from './pages/Portfolio/Portfolio'
import Watchlist from './pages/Watchlist/Watchlist'
import Login from './pages/Login/Login'
import Settings from './pages/Settings/Settings'
import Signup from "./pages/Signup";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/learning" element={<FinanceLearning />} />

        {/* Protected application */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <MainLayout>
                <StockAnalysis />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/strategies"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Strategies />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/backtesting"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Backtesting />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Portfolio />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Watchlist />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App