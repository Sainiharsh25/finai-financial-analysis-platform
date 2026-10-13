import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import api from '../../services/api'
import Navbar from '../../pages/Navbar/Navbar'
function StockAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams()

  const querySymbol = (searchParams.get('symbol') || 'RELIANCE')
    .trim()
    .toUpperCase()

  const [symbol, setSymbol] = useState(querySymbol)
  const [searchInput, setSearchInput] = useState(querySymbol)

  const [prices, setPrices] = useState([])
  const [rsi, setRsi] = useState(null)
  const [ema20, setEma20] = useState(null)
  const [macd, setMacd] = useState(null)
  const [bollinger, setBollinger] = useState(null)
  const [aiAnalysis, setAiAnalysis] = useState(null)

  const [loadingPrices, setLoadingPrices] = useState(true)
  const [loadingRsi, setLoadingRsi] = useState(true)
  const [loadingEma, setLoadingEma] = useState(true)
  const [loadingMacd, setLoadingMacd] = useState(true)
  const [loadingBollinger, setLoadingBollinger] = useState(true)
  const [loadingAi, setLoadingAi] = useState(true)

  const [pageError, setPageError] = useState('')
  const [searchError, setSearchError] = useState('')

  // Keep the input and API symbol synchronized with the URL.
  useEffect(() => {
    setSymbol(querySymbol)
    setSearchInput(querySymbol)
  }, [querySymbol])

  const fetchPrices = useCallback(async (stockSymbol) => {
    setLoadingPrices(true)

    try {
      const response = await api.get(`/api/prices/${stockSymbol}`)
      const rows = Array.isArray(response.data) ? response.data : []

      const chartRows = rows
        .filter(
          (item) =>
            item.tradingDate &&
            item.closePrice !== null &&
            item.closePrice !== undefined
        )
        .sort(
          (a, b) =>
            new Date(a.tradingDate) - new Date(b.tradingDate)
        )
        .map((item) => ({
          date: item.tradingDate,
          price: Number(item.closePrice),
        }))
        .filter((item) => Number.isFinite(item.price))

      setPrices(chartRows)
    } catch (error) {
      console.error('Historical prices error:', error)
      setPrices([])
    } finally {
      setLoadingPrices(false)
    }
  }, [])

  const fetchRsi = useCallback(async (stockSymbol) => {
    setLoadingRsi(true)
    setRsi(null)

    try {
      const response = await api.get(
        `/api/indicators/${stockSymbol}/rsi?period=14`
      )
      setRsi(response.data)
    } catch (error) {
      console.error('RSI API error:', error)
    } finally {
      setLoadingRsi(false)
    }
  }, [])

  const fetchEma = useCallback(async (stockSymbol) => {
    setLoadingEma(true)
    setEma20(null)

    try {
      const response = await api.get(
        `/api/indicators/${stockSymbol}/ema?period=20`
      )
      setEma20(response.data)
    } catch (error) {
      console.error('EMA API error:', error)
    } finally {
      setLoadingEma(false)
    }
  }, [])

  const fetchMacd = useCallback(async (stockSymbol) => {
    setLoadingMacd(true)
    setMacd(null)

    try {
      const response = await api.get(
        `/api/indicators/${stockSymbol}/macd`
      )
      setMacd(response.data)
    } catch (error) {
      console.error('MACD API error:', error)
    } finally {
      setLoadingMacd(false)
    }
  }, [])

  const fetchBollinger = useCallback(async (stockSymbol) => {
    setLoadingBollinger(true)
    setBollinger(null)

    try {
      const response = await api.get(
        `/api/indicators/${stockSymbol}/bollinger?period=20`
      )
      setBollinger(response.data)
    } catch (error) {
      console.error('Bollinger API error:', error)
    } finally {
      setLoadingBollinger(false)
    }
  }, [])

  const fetchAiAnalysis = useCallback(async (stockSymbol) => {
    setLoadingAi(true)
    setAiAnalysis(null)

    try {
      const response = await api.get(
        `/api/ai/analysis/${stockSymbol}`
      )
      setAiAnalysis(response.data)
    } catch (error) {
      console.error('AI Analysis API error:', error)
    } finally {
      setLoadingAi(false)
    }
  }, [])

  // Load all data whenever the selected stock changes.
  useEffect(() => {
    if (!symbol) return

    setPageError('')

    fetchPrices(symbol)
    fetchRsi(symbol)
    fetchEma(symbol)
    fetchMacd(symbol)
    fetchBollinger(symbol)
    fetchAiAnalysis(symbol)
  }, [
    symbol,
    fetchPrices,
    fetchRsi,
    fetchEma,
    fetchMacd,
    fetchBollinger,
    fetchAiAnalysis,
  ])

  const handleSearch = (event) => {
    event.preventDefault()

    const nextSymbol = searchInput.trim().toUpperCase()

    if (!/^[A-Z0-9.^_-]{1,30}$/.test(nextSymbol)) {
      setSearchError('Enter a valid stock symbol.')
      return
    }

    setSearchError('')
    setPageError('')

    if (nextSymbol === symbol) {
      // Reload the current stock when Analyze is clicked again.
      setSymbol('')
      setTimeout(() => setSymbol(nextSymbol), 0)
      return
    }

    setSearchParams({ symbol: nextSymbol })
  }

  const handleRefreshAi = () => {
    fetchAiAnalysis(symbol)
  }

  const formatPrice = (value) => {
    const number = Number(value)

    if (value === null || value === undefined || !Number.isFinite(number)) {
      return 'N/A'
    }

    return `₹${number.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatNumber = (value) => {
    const number = Number(value)
    return value !== null && value !== undefined && Number.isFinite(number)
      ? number.toFixed(2)
      : 'N/A'
  }

  const currentPrice =
    prices.length > 0 ? prices[prices.length - 1].price : null

  const previousPrice =
    prices.length > 1 ? prices[prices.length - 2].price : null

  const priceChange =
    currentPrice !== null && previousPrice !== null
      ? currentPrice - previousPrice
      : null

  const priceChangePercent =
    priceChange !== null && previousPrice !== 0
      ? (priceChange / previousPrice) * 100
      : null

  const numericRsi = Number(rsi)
  const validRsi = rsi !== null && Number.isFinite(numericRsi)

  const macdValue = Number(macd?.macd)
  const signalValue = Number(macd?.signal)
  const histogramValue = Number(macd?.histogram)

  const validMacd =
    macd?.macd !== null &&
    macd?.macd !== undefined &&
    macd?.signal !== null &&
    macd?.signal !== undefined &&
    Number.isFinite(macdValue) &&
    Number.isFinite(signalValue)

  const macdStatus = validMacd
    ? macdValue > signalValue
      ? 'Bullish'
      : macdValue < signalValue
        ? 'Bearish'
        : 'Neutral'
    : 'Unavailable'

  const bollingerChartData =
    bollinger && prices.length > 0
      ? [
          {
            date: prices[prices.length - 1].date,
            price: currentPrice,
            upper: Number(bollinger.upperBand),
            middle: Number(bollinger.middleBand),
            lower: Number(bollinger.lowerBand),
          },
        ].filter(
          (item) =>
            Number.isFinite(item.price) &&
            Number.isFinite(item.upper) &&
            Number.isFinite(item.middle) &&
            Number.isFinite(item.lower)
        )
      : []

  return (
    <div className="min-h-full bg-slate-100">
      {/* Header with stock search, theme toggle and profile */}
<header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    {/* Page title */}
    <div className="min-w-0">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Stock Analysis
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Technical indicators and AI-powered market insights
      </p>
    </div>

    {/* Search and right-side controls */}
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <form
        onSubmit={handleSearch}
        className="flex min-w-0 flex-1 gap-2 sm:flex-initial"
      >
        <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value.toUpperCase())
                setSearchError('')
              }}
              placeholder="Stock symbol, e.g. TCS"
              aria-label="Stock symbol"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-900"
            />
          </div>

          {searchError && (
            <p className="mt-1 text-xs text-red-600">
              {searchError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Search size={17} />
          <span>Analyze</span>
        </button>
      </form>

      {/* Dark/light toggle and profile menu */}
      <div className="shrink-0">
        <Navbar />
      </div>
    </div>
  </div>
</header>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{pageError}</p>
          </div>
        )}

        {/* Stock overview */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  {symbol}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Stored market data
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Latest available historical record
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-3xl font-bold text-slate-900">
                {loadingPrices ? 'Loading...' : formatPrice(currentPrice)}
              </p>

              {priceChange !== null && priceChangePercent !== null ? (
                <p
                  className={`mt-1 flex items-center gap-1 text-sm font-medium sm:justify-end ${
                    priceChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {priceChange >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {priceChange >= 0 ? '+' : ''}
                  {formatPrice(priceChange)} (
                  {priceChangePercent >= 0 ? '+' : ''}
                  {priceChangePercent.toFixed(2)}%)
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  {prices.length < 2
                    ? 'Not enough price history to calculate change'
                    : ''}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Historical closing price chart */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Price Movement
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Closing prices saved in your database
            </p>
          </div>

          <div className="mt-6 h-72 w-full sm:h-80">
            {loadingPrices ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading price history...
              </div>
            ) : prices.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                No historical prices found for {symbol}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    minTickGap={25}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    width={65}
                  />
                  <Tooltip
                    formatter={(value) => [formatPrice(value), 'Close']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Closing price"
                    stroke="#0f766e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Indicator cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* RSI */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">RSI (14)</p>
              <Activity size={18} className="text-slate-400" />
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {loadingRsi ? 'Loading...' : validRsi ? numericRsi.toFixed(2) : 'N/A'}
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                validRsi && numericRsi < 30
                  ? 'bg-amber-50 text-amber-700'
                  : validRsi && numericRsi > 70
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {loadingRsi
                ? 'Loading...'
                : !validRsi
                  ? 'Unavailable'
                  : numericRsi < 30
                    ? 'Oversold'
                    : numericRsi > 70
                      ? 'Overbought'
                      : 'Neutral'}
            </span>
          </div>

          {/* EMA */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">EMA (20)</p>
              <TrendingUp size={18} className="text-slate-400" />
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {loadingEma ? 'Loading...' : formatPrice(ema20)}
            </p>

            <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              20-period average
            </span>
          </div>

          {/* MACD */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">MACD</p>
              {macdStatus === 'Bearish' ? (
                <TrendingDown size={18} className="text-red-500" />
              ) : (
                <TrendingUp size={18} className="text-emerald-500" />
              )}
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {loadingMacd ? 'Loading...' : validMacd ? macdValue.toFixed(2) : 'N/A'}
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                macdStatus === 'Bearish'
                  ? 'bg-red-50 text-red-600'
                  : macdStatus === 'Bullish'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {loadingMacd ? 'Loading...' : macdStatus}
            </span>
          </div>

          {/* Bollinger */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Bollinger Bands
              </p>
              <Activity size={18} className="text-slate-400" />
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {loadingBollinger
                ? 'Loading...'
                : formatPrice(bollinger?.middleBand)}
            </p>

            <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Middle Band
            </span>
          </div>
        </section>

        {/* MACD details */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              MACD Details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Moving Average Convergence Divergence
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'MACD', value: macd?.macd },
              { label: 'Signal Line', value: macd?.signal },
              { label: 'Histogram', value: macd?.histogram },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {loadingMacd ? 'Loading...' : formatNumber(item.value)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bollinger details */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Bollinger Bands
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Upper, middle and lower bands for {symbol}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Upper Band', value: bollinger?.upperBand },
              { label: 'Middle Band', value: bollinger?.middleBand },
              { label: 'Lower Band', value: bollinger?.lowerBand },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {loadingBollinger ? 'Loading...' : formatPrice(item.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 h-72 w-full sm:h-80">
            {loadingBollinger ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading Bollinger Bands...
              </div>
            ) : bollingerChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                Price history and Bollinger values are required to plot this chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bollingerChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [formatPrice(value)]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <ReferenceLine
                    y={currentPrice}
                    stroke="#64748b"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="upper"
                    name="Upper Band"
                    stroke="#dc2626"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="middle"
                    name="Middle Band"
                    stroke="#64748b"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower"
                    name="Lower Band"
                    stroke="#2563eb"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    name="Latest Price"
                    stroke="#0f766e"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            The chart displays the latest available price alongside the
            current bands. It is a snapshot, not a historical band series.
          </p>
        </section>

        {/* AI Analysis */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                <Brain size={20} className="text-white" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  AI Analysis
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  LLM-generated explanation for {symbol}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshAi}
              disabled={loadingAi}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loadingAi ? 'animate-spin' : ''}
              />
              {loadingAi ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 sm:p-5">
            {loadingAi ? (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw size={18} className="animate-spin" />
                Generating AI analysis...
              </div>
            ) : aiAnalysis?.aiExplanation ? (
              <div className="whitespace-pre-line break-words text-sm leading-7 text-slate-700">
                {aiAnalysis.aiExplanation}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                AI analysis is currently unavailable. Try refreshing the analysis.
              </p>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-500">
              This explanation is based on calculated technical indicators
              and is for informational purposes only. It is not financial advice.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StockAnalysis