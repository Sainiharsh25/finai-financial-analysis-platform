import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from 'lucide-react'

import api from '../../services/api'
import Navbar from '../../pages/Navbar/Navbar'

function Strategies() {
  const [symbol, setSymbol] = useState('RELIANCE')
  const [searchSymbol, setSearchSymbol] = useState('RELIANCE')

  const [rsi, setRsi] = useState(null)
  const [ema, setEma] = useState(null)
  const [macd, setMacd] = useState(null)
  const [bollinger, setBollinger] = useState(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [searchError, setSearchError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchStrategies = useCallback(async (stockSymbol) => {
    setLoading(true)
    setError('')

    try {
      const [
        rsiResponse,
        emaResponse,
        macdResponse,
        bollingerResponse,
      ] = await Promise.all([
        api.get(`/api/strategies/${stockSymbol}/rsi`),
        api.get(`/api/strategies/${stockSymbol}/ema-crossover`),
        api.get(`/api/strategies/${stockSymbol}/macd`),
        api.get(`/api/strategies/${stockSymbol}/bollinger`),
      ])

      setRsi(rsiResponse.data)
      setEma(emaResponse.data)
      setMacd(macdResponse.data)
      setBollinger(bollingerResponse.data)
    } catch (err) {
      console.error('Strategy API error:', err)

      setError(
        err.response?.data?.message ||
          'Unable to load strategy data. Please check the stock symbol and backend connection.'
      )

      setRsi(null)
      setEma(null)
      setMacd(null)
      setBollinger(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!symbol) return

    fetchStrategies(symbol)
  }, [symbol, refreshKey, fetchStrategies])

  const handleStockChange = (event) => {
    event.preventDefault()

    const newSymbol = searchSymbol.trim().toUpperCase()

    if (!/^[A-Z0-9.^_-]{1,30}$/.test(newSymbol)) {
      setSearchError('Enter a valid stock symbol.')
      return
    }

    setSearchError('')
    setError('')

    if (newSymbol === symbol) {
      setRefreshKey((previous) => previous + 1)
    } else {
      setSymbol(newSymbol)
    }
  }

  const handleRefresh = () => {
    if (loading) return

    setRefreshing(true)
    setRefreshKey((previous) => previous + 1)
  }

  const getSignalStyle = (signal) => {
    if (signal === 'BUY') {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
    }

    if (signal === 'SELL') {
      return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
    }

    return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
  }

  const getSignalIcon = (signal) => {
    if (signal === 'BUY') {
      return <TrendingUp size={14} />
    }

    if (signal === 'SELL') {
      return <TrendingDown size={14} />
    }

    return <Minus size={14} />
  }

  const getRsiStatus = (value) => {
    if (!Number.isFinite(value)) return '--'
    if (value < 30) return 'Oversold'
    if (value > 70) return 'Overbought'
    return 'Neutral'
  }

  const getMacdStatus = (signal) => {
    if (signal === 'BUY') return 'Bullish'
    if (signal === 'SELL') return 'Bearish'
    return 'Neutral'
  }

  const getBollingerStatus = (signal) => {
    if (signal === 'BUY') return 'Below Lower Band'
    if (signal === 'SELL') return 'Above Upper Band'
    return 'Within Bands'
  }

  const formatNumber = (value) => {
    const number = Number(value)

    return value !== null &&
      value !== undefined &&
      Number.isFinite(number)
      ? number.toFixed(2)
      : '--'
  }

  const formatPrice = (value) => {
    const number = Number(value)

    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(number)
    ) {
      return '--'
    }

    return `₹${number.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const strategies = useMemo(
    () => [
      {
        name: 'RSI Strategy',
        description:
          'Identifies potential overbought and oversold conditions.',
        indicator: 'RSI (14)',
        signal: rsi?.signal || 'HOLD',
        value:
          rsi?.indicatorValue !== undefined
            ? formatNumber(rsi.indicatorValue)
            : '--',
        status:
          rsi?.indicatorValue !== undefined
            ? getRsiStatus(Number(rsi.indicatorValue))
            : '--',
        reason: rsi?.reason || 'No strategy information available.',
      },
      {
        name: 'EMA Crossover',
        description:
          'Compares short-term and long-term exponential moving averages.',
        indicator: 'EMA 20 / EMA 50',
        signal: ema?.signal || 'HOLD',
        value:
          ema?.indicatorValue !== undefined
            ? formatNumber(ema.indicatorValue)
            : '--',
        status:
          ema?.signal === 'BUY'
            ? 'Bullish'
            : ema?.signal === 'SELL'
              ? 'Bearish'
              : 'Neutral',
        reason: ema?.reason || 'No strategy information available.',
      },
      {
        name: 'MACD Strategy',
        description:
          'Uses MACD and signal-line crossover to identify momentum.',
        indicator: 'MACD',
        signal: macd?.tradeSignal || 'HOLD',
        value:
          macd?.macd !== undefined
            ? formatNumber(macd.macd)
            : '--',
        status: getMacdStatus(macd?.tradeSignal),
        reason: macd?.reason || 'No strategy information available.',
      },
      {
        name: 'Bollinger Bands',
        description:
          'Checks price position relative to the upper and lower bands.',
        indicator: 'Bollinger Bands',
        signal: bollinger?.tradeSignal || 'HOLD',
        value:
          bollinger?.currentPrice !== undefined
            ? formatPrice(bollinger.currentPrice)
            : '--',
        status: getBollingerStatus(bollinger?.tradeSignal),
        reason:
          bollinger?.reason || 'No strategy information available.',
      },
    ],
    [rsi, ema, macd, bollinger]
  )

  const cardClass =
    'min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6'

  const mutedClass = 'text-slate-500 dark:text-slate-400'

  return (
    <div className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="-mx-4 -mt-4 mb-6 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 pl-12 sm:pl-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Trading Strategies
            </h1>

            <p className={`mt-1 text-sm ${mutedClass}`}>
              Analyze technical indicators and strategy signals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw
                size={17}
                className={refreshing ? 'animate-spin' : ''}
              />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <Navbar />
          </div>
        </div>
      </header>

      {/* Stock selector */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className={`text-sm ${mutedClass}`}>
              Selected Stock
            </p>

            <h2 className="mt-1 break-words text-xl font-bold text-slate-900 dark:text-white">
              {symbol}
            </h2>

            <p className={`mt-1 text-xs ${mutedClass}`}>
              Strategy signals are calculated using your backend APIs.
            </p>
          </div>

          <form
            onSubmit={handleStockChange}
            className="flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:w-auto"
          >
            <div className="min-w-0 flex-1">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchSymbol}
                  onChange={(event) => {
                    setSearchSymbol(event.target.value.toUpperCase())
                    setSearchError('')
                  }}
                  placeholder="Enter symbol"
                  aria-label="Stock symbol"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-base font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-900 sm:w-48"
                />
              </div>

              {searchError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {searchError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="min-h-10 shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Change Stock
            </button>
          </form>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Unable to load strategies
            </p>

            <p className="mt-1 break-words text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-36 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-56 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="h-6 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="h-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="mt-4 h-16 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* Strategy cards */}
      {!loading && !error && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {strategies.map((strategy) => (
            <article
              key={strategy.name}
              className={cardClass}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-lg font-semibold text-slate-900 dark:text-white">
                    {strategy.name}
                  </h2>

                  <p className={`mt-1 text-sm leading-5 ${mutedClass}`}>
                    {strategy.description}
                  </p>
                </div>

                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:px-3 ${getSignalStyle(
                    strategy.signal
                  )}`}
                >
                  {getSignalIcon(strategy.signal)}
                  {strategy.signal}
                </span>
              </div>

              {/* Indicator / Value */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="min-w-0 rounded-lg bg-slate-50 p-3 dark:bg-slate-800 sm:p-4">
                  <p className={`text-xs ${mutedClass}`}>
                    Indicator
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
                    {strategy.indicator}
                  </p>
                </div>

                <div className="min-w-0 rounded-lg bg-slate-50 p-3 dark:bg-slate-800 sm:p-4">
                  <p className={`text-xs ${mutedClass}`}>
                    Value
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
                    {strategy.value}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className={`text-xs ${mutedClass}`}>
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {strategy.status}
                </p>
              </div>

              {/* Backend reason */}
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/70">
                <p className={`text-xs font-medium ${mutedClass}`}>
                  Strategy Analysis
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {strategy.reason}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className={`text-xs leading-5 ${mutedClass}`}>
          Strategy signals are generated from technical indicators and
          are intended for analysis purposes only. They are not financial
          advice or guaranteed trading recommendations.
        </p>
      </div>
    </div>
  )
}

export default Strategies
