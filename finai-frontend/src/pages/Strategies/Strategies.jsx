import { useEffect, useState } from 'react'
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
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchStrategies = async (stockSymbol = symbol) => {
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
  }

  useEffect(() => {
    fetchStrategies()
  }, [symbol])

  const handleStockChange = (e) => {
    e.preventDefault()

    const newSymbol = searchSymbol.trim().toUpperCase()

    if (!newSymbol) {
      return
    }

    setSymbol(newSymbol)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStrategies(symbol)
  }

  const getSignalStyle = (signal) => {
    if (signal === 'BUY') {
      return 'bg-green-100 text-green-700'
    }

    if (signal === 'SELL') {
      return 'bg-red-100 text-red-700'
    }

    return 'bg-yellow-100 text-yellow-700'
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
    if (value < 30) {
      return 'Oversold'
    }

    if (value > 70) {
      return 'Overbought'
    }

    return 'Neutral'
  }

  const getMacdStatus = (signal) => {
    if (signal === 'BUY') {
      return 'Bullish'
    }

    if (signal === 'SELL') {
      return 'Bearish'
    }

    return 'Neutral'
  }

  const getBollingerStatus = (signal) => {
    if (signal === 'BUY') {
      return 'Below Lower Band'
    }

    if (signal === 'SELL') {
      return 'Above Upper Band'
    }

    return 'Within Bands'
  }

  const strategies = [
    {
      name: 'RSI Strategy',
      description:
        'Identifies potential overbought and oversold conditions.',
      indicator: 'RSI (14)',
      signal: rsi?.signal || 'HOLD',
      value:
        rsi?.indicatorValue !== undefined
          ? Number(rsi.indicatorValue).toFixed(2)
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
          ? Number(ema.indicatorValue).toFixed(2)
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
          ? Number(macd.macd).toFixed(2)
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
          ? `₹${Number(bollinger.currentPrice).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : '--',
      status: getBollingerStatus(bollinger?.tradeSignal),
      reason:
        bollinger?.reason || 'No strategy information available.',
    },
  ]

  return (
    <div className="p-4 sm:p-6">

    

{/* Header */}
<div className="mb-6 -mx-4 -mt-4 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-5 lg:-mx-8 lg:-mt-8 lg:px-8">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Trading Strategies
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Analyze technical indicators and strategy signals
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={refreshing || loading}
        className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
</div>


      {/* Stock selector */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Selected Stock
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {symbol}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Strategy signals are calculated using your backend APIs.
            </p>
          </div>

          <form
            onSubmit={handleStockChange}
            className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
          >
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchSymbol}
                onChange={(e) =>
                  setSearchSymbol(e.target.value.toUpperCase())
                }
                placeholder="Enter symbol"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-48"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Change Stock
            </button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load strategies
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-36 rounded bg-slate-200" />
                  <div className="h-4 w-64 rounded bg-slate-200" />
                </div>

                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="h-20 rounded-lg bg-slate-100" />
                <div className="h-20 rounded-lg bg-slate-100" />
              </div>

              <div className="mt-4 h-12 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* Strategy cards */}
      {!loading && (
        <div className="grid gap-5 md:grid-cols-2">

          {strategies.map((strategy) => (
            <div
              key={strategy.name}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
            >

              {/* Card header */}
              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {strategy.name}
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {strategy.description}
                  </p>
                </div>

                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getSignalStyle(
                    strategy.signal
                  )}`}
                >
                  {getSignalIcon(strategy.signal)}
                  {strategy.signal}
                </span>
              </div>

              {/* Indicator / Value */}
              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Indicator
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {strategy.indicator}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Value
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {strategy.value}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {strategy.status}
                </p>
              </div>

              {/* Backend reason */}
              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Strategy Analysis
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {strategy.reason}
                </p>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs leading-5 text-slate-500">
          Strategy signals are generated from technical indicators and
          are intended for analysis purposes only. They are not financial
          advice or guaranteed trading recommendations.
        </p>
      </div>

    </div>
  )
}

export default Strategies