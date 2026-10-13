
import { useCallback, useEffect, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  RefreshCw,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../pages/Navbar/Navbar'
import { usePreferences } from '../../hooks/PreferencesContext'

const formatCurrency = (value) =>
  value == null || !Number.isFinite(Number(value))
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })}`

const formatPercent = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  const number = Number(value)
  return `${number > 0 ? '+' : ''}${number.toFixed(2)}%`
}

const getSignal = (data) => {
  if (typeof data === 'string') return data.toUpperCase()
  if (!data || typeof data !== 'object') return null

  const candidates = [
    data.signal,
    data.recommendation,
    data.action,
    data.status,
    data.tradingSignal,
  ]

  const signal = candidates.find(
    (value) =>
      typeof value === 'string' &&
      ['BUY', 'SELL', 'HOLD'].includes(value.toUpperCase()),
  )

  return signal ? signal.toUpperCase() : null
}

const getIndicatorValue = (data) => {
  if (typeof data === 'number' || typeof data === 'string') {
    return String(data)
  }

  if (!data || typeof data !== 'object') return '—'

  const value =
    data.rsi ??
    data.macd ??
    data.ema ??
    data.value ??
    data.indicatorValue ??
    data.price

  return value == null ? '—' : String(value)
}

const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDefaultStartDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  return toDateInputValue(date)
}

const formatSnapshotDate = (value) => {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      })
}

function Dashboard() {
  const navigate = useNavigate()
  const { preferences, toggleDarkMode } = usePreferences()
  const isDark = preferences.darkMode

  const [portfolio, setPortfolio] = useState(null)
  const [watchlist, setWatchlist] = useState([])
  const [recentSignals, setRecentSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [signalsLoading, setSignalsLoading] = useState(false)

  const [snapshots, setSnapshots] = useState([])
  const [snapshotsLoading, setSnapshotsLoading] = useState(false)
  const [snapshotError, setSnapshotError] = useState('')
  const [snapshotMessage, setSnapshotMessage] = useState('')
  const [savingSnapshot, setSavingSnapshot] = useState(false)

  const [startDate, setStartDate] = useState(getDefaultStartDate)
  const [endDate, setEndDate] = useState(() =>
    toDateInputValue(new Date()),
  )

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [portfolioResult, watchlistResult] =
        await Promise.allSettled([
          api.get('/api/portfolio/summary'),
          api.get('/api/watchlist'),
        ])

      if (portfolioResult.status === 'fulfilled') {
        setPortfolio(portfolioResult.value.data)
      } else {
        setPortfolio(null)
      }

      if (watchlistResult.status === 'fulfilled') {
        const data = watchlistResult.value.data
        setWatchlist(Array.isArray(data) ? data : [])
      } else {
        setWatchlist([])
      }

      if (
        portfolioResult.status === 'rejected' &&
        watchlistResult.status === 'rejected'
      ) {
        setError(
          'Could not load dashboard data. Check that the backend is running and you are logged in.',
        )
      } else if (portfolioResult.status === 'rejected') {
        setError('Portfolio summary could not be loaded.')
      } else if (watchlistResult.status === 'rejected') {
        setError('Watchlist could not be loaded.')
      }
    } catch {
      setError('Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSnapshots = useCallback(async () => {
    if (!startDate || !endDate) return

    if (startDate > endDate) {
      setSnapshotError('Start date cannot be after end date.')
      setSnapshots([])
      return
    }

    setSnapshotsLoading(true)
    setSnapshotError('')

    try {
      const response = await api.get('/api/portfolio/snapshots', {
        params: { startDate, endDate },
      })

      const data = Array.isArray(response.data) ? response.data : []

      const formattedSnapshots = data
        .map((snapshot) => {
          const date = snapshot.snapshotDate ?? snapshot.date

          return {
            ...snapshot,
            snapshotDate: date,
            dateLabel: formatSnapshotDate(date),
            portfolioValue: Number(snapshot.portfolioValue ?? 0),
            investedValue: Number(snapshot.investedValue ?? 0),
            profitLoss: Number(snapshot.profitLoss ?? 0),
          }
        })
        .filter(
          (snapshot) =>
            snapshot.snapshotDate &&
            Number.isFinite(snapshot.portfolioValue) &&
            Number.isFinite(snapshot.investedValue),
        )

      setSnapshots(formattedSnapshots)
    } catch (err) {
      setSnapshots([])
      setSnapshotError(
        err.response?.data?.message ||
          'Could not load portfolio history. Check the snapshot API and your login.',
      )
    } finally {
      setSnapshotsLoading(false)
    }
  }, [startDate, endDate])

  const saveTodaySnapshot = async () => {
    setSavingSnapshot(true)
    setSnapshotError('')
    setSnapshotMessage('')

    try {
      await api.post('/api/portfolio/snapshots')

      setSnapshotMessage(
        "Today's portfolio snapshot was saved successfully.",
      )

      await Promise.all([loadSnapshots(), loadDashboard()])
    } catch (err) {
      setSnapshotError(
        err.response?.data?.message ||
          "Could not save today's snapshot. Check your login and backend.",
      )
    } finally {
      setSavingSnapshot(false)
    }
  }

  const loadSignals = useCallback(async (stocks) => {
    if (!stocks.length) {
      setRecentSignals([])
      setSignalsLoading(false)
      return
    }

    setSignalsLoading(true)

    try {
      const selectedStocks = stocks.slice(0, 4)

      const strategies = [
        {
          name: 'RSI Strategy',
          path: (symbol) => `/api/strategies/${symbol}/rsi`,
        },
        {
          name: 'MACD Strategy',
          path: (symbol) => `/api/strategies/${symbol}/macd`,
        },
        {
          name: 'EMA Crossover',
          path: (symbol) => `/api/strategies/${symbol}/ema-crossover`,
        },
        {
          name: 'Bollinger Strategy',
          path: (symbol) => `/api/strategies/${symbol}/bollinger`,
        },
      ]

      const requests = selectedStocks.flatMap((stock) =>
        strategies.map(async (strategy) => {
          try {
            const response = await api.get(
              strategy.path(stock.symbol),
            )

            const data = response.data

            return {
              symbol: stock.symbol,
              strategy: strategy.name,
              signal: getSignal(data) || 'N/A',
              value: getIndicatorValue(data),
            }
          } catch {
            return null
          }
        }),
      )

      const results = await Promise.all(requests)
      setRecentSignals(results.filter(Boolean).slice(0, 8))
    } finally {
      setSignalsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    loadSnapshots()
  }, [loadSnapshots])

  useEffect(() => {
    loadSignals(watchlist)
  }, [watchlist, loadSignals])

  const handleSearch = (event) => {
    event.preventDefault()

    const symbol = searchInput.trim().toUpperCase()

    if (symbol) {
      navigate(`/analysis?symbol=${encodeURIComponent(symbol)}`)
    }
  }

  const portfolioValue = portfolio?.totalValue
  const totalProfitLoss = portfolio?.totalProfitLoss
  const totalReturn = portfolio?.totalReturn
  const holdingCount = portfolio?.totalHoldings ?? 0
  const profitIsPositive = Number(totalProfitLoss ?? 0) >= 0

  // Shared styles switch according to the saved theme preference.
  const card = isDark
    ? 'border-slate-800 bg-slate-900 text-slate-100'
    : 'border-slate-200 bg-white text-slate-900'

  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const heading = isDark ? 'text-white' : 'text-slate-900'
  const panel = isDark ? 'bg-slate-800/70' : 'bg-slate-50'
  const input = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:ring-slate-700'
    : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200'
  const button = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
  const separator = isDark ? 'border-slate-800' : 'border-slate-100'
  const chartGrid = isDark ? '#334155' : '#e2e8f0'
  const chartAxis = isDark ? '#94a3b8' : '#64748b'
  const chartTooltip = isDark
    ? {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        color: '#f1f5f9',
        borderRadius: 10,
        fontSize: 12,
      }
    : {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        color: '#0f172a',
        borderRadius: 10,
        fontSize: 12,
      }

  return (
    <div
      data-theme={isDark ? 'dark' : 'light'}
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Dashboard header */}
      <header
        className={`border-b px-4 py-5 sm:px-6 lg:px-8 ${
          isDark
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${heading}`}>
              Dashboard
            </h1>
            <p className={`mt-1 text-sm ${muted}`}>
              Overview of your financial activity and market signals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="relative min-w-0 flex-1 sm:w-72 sm:flex-none"
            >
              <Search
                size={18}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search stock, e.g. TCS"
                aria-label="Search stock symbol"
                className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:ring-2 ${input}`}
              />
            </form>

            <button
              type="button"
              onClick={() => {
                loadDashboard()
                loadSnapshots()
              }}
              disabled={loading || snapshotsLoading}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              className={`flex shrink-0 items-center justify-center rounded-lg border px-3 py-2.5 disabled:opacity-50 ${button}`}
            >
              <RefreshCw
                size={17}
                className={
                  loading || snapshotsLoading ? 'animate-spin' : ''
                }
              />
            </button>

            

            <Navbar />
          </div>
        </div>
      </header>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {error && (
          <div
            role="alert"
            className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
              isDark
                ? 'border-amber-900 bg-amber-950/40 text-amber-200'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>{error}</p>
              <button
                type="button"
                onClick={loadDashboard}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={`rounded-xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${muted}`}>Portfolio Value</p>
              <div className={`rounded-lg p-2 ${panel}`}>
                <Activity size={18} className={muted} />
              </div>
            </div>
            <p className={`mt-4 break-words text-2xl font-bold ${heading}`}>
              {loading ? 'Loading…' : formatCurrency(portfolioValue)}
            </p>
            <p className={`mt-2 text-xs ${muted}`}>
              Current value of your holdings
            </p>
          </div>

          <div className={`rounded-xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${muted}`}>Total P&amp;L</p>
              <div className={`rounded-lg p-2 ${
                profitIsPositive
                  ? isDark ? 'bg-emerald-950' : 'bg-emerald-50'
                  : isDark ? 'bg-red-950' : 'bg-red-50'
              }`}>
                {profitIsPositive ? (
                  <TrendingUp size={18} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={18} className="text-red-500" />
                )}
              </div>
            </div>
            <p className={`mt-4 break-words text-2xl font-bold ${
              profitIsPositive ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {loading ? 'Loading…' : formatCurrency(totalProfitLoss)}
            </p>
            <p className={`mt-2 text-xs ${muted}`}>
              {loading
                ? 'Loading return…'
                : `${formatPercent(totalReturn)} overall return`}
            </p>
          </div>

          <div className={`rounded-xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${muted}`}>Watchlist</p>
              <div className={`rounded-lg p-2 ${
                isDark ? 'bg-amber-950' : 'bg-amber-50'
              }`}>
                <Star size={18} className="text-amber-500" />
              </div>
            </div>
            <p className={`mt-4 text-2xl font-bold ${heading}`}>
              {loading ? '…' : watchlist.length}
            </p>
            <p className={`mt-2 text-xs ${muted}`}>
              Stocks you’re tracking
            </p>
          </div>

          <div className={`rounded-xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${muted}`}>Portfolio Holdings</p>
              <div className={`rounded-lg p-2 ${
                isDark ? 'bg-blue-950' : 'bg-blue-50'
              }`}>
                <Activity size={18} className="text-blue-500" />
              </div>
            </div>
            <p className={`mt-4 text-2xl font-bold ${heading}`}>
              {loading ? '…' : holdingCount}
            </p>
            <p className={`mt-2 text-xs ${muted}`}>
              Stocks in your portfolio
            </p>
          </div>
        </section>

        {/* Main grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className={`rounded-xl border p-5 shadow-sm xl:col-span-2 ${card}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`text-lg font-semibold ${heading}`}>
                  Portfolio Overview
                </h2>
                <p className={`mt-1 text-xs ${muted}`}>
                  Your current holdings and overall return
                </p>
              </div>

              <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                profitIsPositive
                  ? isDark
                    ? 'bg-emerald-950 text-emerald-300'
                    : 'bg-emerald-50 text-emerald-700'
                  : isDark
                    ? 'bg-red-950 text-red-300'
                    : 'bg-red-50 text-red-700'
              }`}>
                {loading ? 'Loading…' : formatPercent(totalReturn)}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={`rounded-lg p-4 ${panel}`}>
                <p className={`text-sm ${muted}`}>Invested Value</p>
                <p className={`mt-2 text-xl font-semibold ${heading}`}>
                  {loading
                    ? 'Loading…'
                    : formatCurrency(portfolio?.investedValue)}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${panel}`}>
                <p className={`text-sm ${muted}`}>Current Value</p>
                <p className={`mt-2 text-xl font-semibold ${heading}`}>
                  {loading ? 'Loading…' : formatCurrency(portfolioValue)}
                </p>
              </div>

              {/* Historical portfolio chart */}
              <div className={`rounded-lg p-4 sm:col-span-2 ${panel}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      Historical portfolio performance
                    </p>
                    <p className={`mt-1 text-xs leading-5 ${muted}`}>
                      Compare your recorded portfolio value with the amount invested.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={saveTodaySnapshot}
                    disabled={savingSnapshot || snapshotsLoading}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-slate-900 text-white hover:bg-slate-700'
                    }`}
                  >
                    {savingSnapshot ? 'Saving…' : "Record today's value"}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className={`text-xs font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    From
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) => {
                        setSnapshotMessage('')
                        setStartDate(event.target.value)
                      }}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none ${input}`}
                    />
                  </label>

                  <label className={`text-xs font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    To
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      max={toDateInputValue(new Date())}
                      onChange={(event) => {
                        setSnapshotMessage('')
                        setEndDate(event.target.value)
                      }}
                      className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none ${input}`}
                    />
                  </label>
                </div>

                {snapshotError && (
                  <p role="alert" className="mt-3 text-sm text-red-500">
                    {snapshotError}
                  </p>
                )}

                {snapshotMessage && (
                  <p role="status" className="mt-3 text-sm text-emerald-500">
                    {snapshotMessage}
                  </p>
                )}

                <div className="mt-5 h-72 w-full">
                  {snapshotsLoading ? (
                    <div className={`flex h-full items-center justify-center text-sm ${muted}`}>
                      Loading portfolio history…
                    </div>
                  ) : snapshots.length === 0 ? (
                    <div className={`flex h-full flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center ${
                      isDark
                        ? 'border-slate-700 bg-slate-900'
                        : 'border-slate-300 bg-white'
                    }`}>
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        No snapshots for this date range
                      </p>
                      <p className={`mt-1 max-w-md text-xs leading-5 ${muted}`}>
                        Record today's portfolio value or select a date range
                        containing saved snapshots. Previous dates will not
                        appear unless snapshots exist for them.
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={snapshots}
                        margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartGrid}
                        />
                        <XAxis
                          dataKey="dateLabel"
                          tick={{ fontSize: 11, fill: chartAxis }}
                          tickLine={false}
                          axisLine={{ stroke: chartGrid }}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `₹${Number(value).toLocaleString('en-IN', {
                              notation: 'compact',
                              maximumFractionDigits: 1,
                            })}`
                          }
                          tick={{ fontSize: 11, fill: chartAxis }}
                          tickLine={false}
                          axisLine={false}
                          width={72}
                        />
                        <Tooltip
                          labelFormatter={(label, payload) =>
                            payload?.[0]?.payload?.snapshotDate || label
                          }
                          formatter={(value, name) => [
                            formatCurrency(value),
                            name === 'Portfolio value'
                              ? 'Portfolio value'
                              : 'Invested value',
                          ]}
                          contentStyle={chartTooltip}
                          itemStyle={{
                            color: isDark ? '#e2e8f0' : '#334155',
                          }}
                          labelStyle={{
                            color: isDark ? '#f8fafc' : '#0f172a',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="portfolioValue"
                          name="Portfolio value"
                          stroke="#0f766e"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="investedValue"
                          name="Invested value"
                          stroke={isDark ? '#94a3b8' : '#64748b'}
                          strokeWidth={2}
                          strokeDasharray="5 4"
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${muted}`}>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
                    Portfolio value
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`h-0.5 w-4 ${
                      isDark ? 'bg-slate-400' : 'bg-slate-500'
                    }`} />
                    Invested value
                  </span>
                  <span className="ml-auto">
                    {snapshots.length} snapshot(s)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/portfolio')}
                  className={`mt-4 rounded-lg border px-4 py-2 text-sm font-medium ${button}`}
                >
                  View portfolio
                </button>
              </div>
            </div>
          </div>

          {/* Watchlist preview */}
          <div className={`rounded-xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className={`text-lg font-semibold ${heading}`}>
                  Watchlist
                </h2>
                <p className={`mt-1 text-xs ${muted}`}>
                  Tracked stocks
                </p>
              </div>
              <Star size={18} className={muted} />
            </div>

            <div className="mt-5 space-y-4">
              {loading ? (
                <p className={`text-sm ${muted}`}>
                  Loading watchlist…
                </p>
              ) : watchlist.length === 0 ? (
                <div className={`rounded-lg p-4 ${panel}`}>
                  <p className={`text-sm ${muted}`}>
                    Your watchlist is empty.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/watchlist')}
                    className={`mt-2 text-sm font-semibold underline ${heading}`}
                  >
                    Add stocks
                  </button>
                </div>
              ) : (
                watchlist.slice(0, 5).map((stock) => {
                  const change = Number(stock.changePercent ?? 0)
                  const positive = change >= 0

                  return (
                    <button
                      type="button"
                      key={stock.symbol}
                      onClick={() =>
                        navigate(
                          `/analysis?symbol=${encodeURIComponent(stock.symbol)}`,
                        )
                      }
                      className={`flex w-full items-center justify-between gap-3 border-b pb-3 text-left last:border-0 last:pb-0 hover:opacity-75 ${separator}`}
                    >
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${heading}`}>
                          {stock.symbol}
                        </p>
                        <p className={`mt-1 text-xs ${muted}`}>
                          {formatCurrency(stock.currentPrice)}
                        </p>
                      </div>

                      <div className={`flex shrink-0 items-center gap-1 text-sm font-medium ${
                        positive ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {positive ? (
                          <ArrowUpRight size={15} />
                        ) : (
                          <ArrowDownRight size={15} />
                        )}
                        {formatPercent(stock.changePercent)}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/watchlist')}
              className={`mt-5 w-full rounded-lg border px-4 py-2.5 text-sm font-medium ${button}`}
            >
              View watchlist
            </button>
          </div>
        </section>

        {/* Recent strategy signals */}
        <section className={`rounded-xl border p-5 shadow-sm ${card}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${heading}`}>
                Recent Signals
              </h2>
              <p className={`mt-1 text-xs ${muted}`}>
                Strategy results for stocks in your watchlist
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/strategies')}
              className={`w-fit text-sm font-medium ${
                isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              View strategies
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className={`border-b text-xs uppercase tracking-wide ${muted} ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Strategy</th>
                  <th className="px-3 py-3 font-medium">Indicator</th>
                  <th className="px-3 py-3 font-medium">Signal</th>
                </tr>
              </thead>

              <tbody>
                {signalsLoading ? (
                  <tr>
                    <td colSpan={4} className={`px-3 py-8 text-center text-sm ${muted}`}>
                      Loading strategy results…
                    </td>
                  </tr>
                ) : recentSignals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`px-3 py-8 text-center text-sm ${muted}`}>
                      No strategy results available. Add stocks to your
                      watchlist or check that historical price data exists.
                    </td>
                  </tr>
                ) : (
                  recentSignals.map((signal, index) => (
                    <tr
                      key={`${signal.symbol}-${signal.strategy}-${index}`}
                      className={`border-b last:border-0 ${separator}`}
                    >
                      <td className={`px-3 py-4 text-sm font-semibold ${heading}`}>
                        {signal.symbol}
                      </td>
                      <td className={`px-3 py-4 text-sm ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {signal.strategy}
                      </td>
                      <td className={`px-3 py-4 text-sm ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {signal.value}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            signal.signal === 'BUY'
                              ? isDark
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-emerald-50 text-emerald-700'
                              : signal.signal === 'SELL'
                                ? isDark
                                  ? 'bg-red-950 text-red-300'
                                  : 'bg-red-50 text-red-700'
                                : signal.signal === 'HOLD'
                                  ? isDark
                                    ? 'bg-slate-700 text-slate-200'
                                    : 'bg-slate-100 text-slate-600'
                                  : isDark
                                    ? 'bg-amber-950 text-amber-300'
                                    : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {signal.signal}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
