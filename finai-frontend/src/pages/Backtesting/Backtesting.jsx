import { useState } from 'react'
import {
  Play,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'

import api from '../../services/api'
import Navbar from '../../pages/Navbar/Navbar'

function Backtesting() {
  const [symbol, setSymbol] = useState('RELIANCE')
  const [strategy, setStrategy] = useState('rsi')
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2026-09-01')
  const [initialCapital, setInitialCapital] = useState('100000')

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strategyNames = {
    rsi: 'RSI Strategy',
    'ema-crossover': 'EMA Crossover Strategy',
    macd: 'MACD Crossover Strategy',
    bollinger: 'Bollinger Bands Strategy',
  }

  const runBacktest = async (e) => {
    e.preventDefault()

    const stockSymbol = symbol.trim().toUpperCase()
    const capital = Number(initialCapital)

    if (!stockSymbol) {
      setError('Please enter a stock symbol.')
      return
    }

    if (!/^[A-Z0-9.^_-]{1,30}$/.test(stockSymbol)) {
      setError('Please enter a valid stock symbol.')
      return
    }

    if (!Number.isFinite(capital) || capital <= 0) {
      setError('Initial capital must be greater than zero.')
      return
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.')
      return
    }

    if (startDate >= endDate) {
      setError('End date must be later than start date.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await api.get(
        `/api/backtests/${encodeURIComponent(stockSymbol)}/${strategy}`,
        {
          params: {
            startDate,
            endDate,
            initialCapital: capital,
          },
        }
      )

      setResult(response.data)
    } catch (err) {
      console.error('Backtest error:', err)

      setError(
        err.response?.data?.message ||
          'Unable to run backtest. Please check the stock symbol, dates, and historical data.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (loading) return

    setSymbol('RELIANCE')
    setStrategy('rsi')
    setStartDate('2026-05-01')
    setEndDate('2026-09-01')
    setInitialCapital('100000')
    setResult(null)
    setError('')
  }

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '--'
    }

    const number = Number(value)

    if (!Number.isFinite(number)) return '--'

    return `₹${number.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatPercent = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '--'
    }

    const number = Number(value)

    if (!Number.isFinite(number)) return '--'

    return `${number.toFixed(2)}%`
  }

  const getReturnColor = (value) => {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return 'text-slate-700 dark:text-slate-300'
    }

    if (number > 0) {
      return 'text-green-600 dark:text-green-400'
    }

    if (number < 0) {
      return 'text-red-600 dark:text-red-400'
    }

    return 'text-slate-700 dark:text-slate-300'
  }

  const getTradeColor = (action) => {
    if (action === 'BUY') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }

    if (action === 'SELL') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }

    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  const cardClass =
    'rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

  const labelClass =
    'mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300'

  const inputClass =
    'min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40'

  return (
    <div className="min-h-full min-w-0 bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="-mx-4 -mt-4 mb-6 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 pl-12 sm:pl-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Backtesting
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Test trading strategies against historical market data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw size={16} />
              Reset
            </button>

            <Navbar />
          </div>
        </div>
      </header>

      {/* Backtest configuration */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Backtest Configuration
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Select a strategy and historical period to evaluate its performance.
          </p>
        </div>

        <form onSubmit={runBacktest}>
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stock */}
            <div className="min-w-0">
              <label htmlFor="backtest-symbol" className={labelClass}>
                Stock Symbol
              </label>

              <input
                id="backtest-symbol"
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase())
                  if (error) setError('')
                }}
                placeholder="RELIANCE"
                maxLength={30}
                autoComplete="off"
                required
                disabled={loading}
                className={`${inputClass} font-medium uppercase`}
              />
            </div>

            {/* Strategy */}
            <div className="min-w-0">
              <label htmlFor="backtest-strategy" className={labelClass}>
                Strategy
              </label>

              <select
                id="backtest-strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                disabled={loading}
                className={inputClass}
              >
                <option value="rsi">RSI Strategy</option>
                <option value="ema-crossover">EMA Crossover</option>
                <option value="macd">MACD Crossover</option>
                <option value="bollinger">Bollinger Bands</option>
              </select>
            </div>

            {/* Initial capital */}
            <div className="min-w-0">
              <label htmlFor="initial-capital" className={labelClass}>
                Initial Capital (₹)
              </label>

              <input
                id="initial-capital"
                type="number"
                min="1"
                step="any"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                disabled={loading}
                className={inputClass}
                required
              />
            </div>

            {/* Start date */}
            <div className="min-w-0">
              <label
                htmlFor="backtest-start-date"
                className={`${labelClass} flex items-center gap-2`}
              >
                <CalendarDays size={15} />
                Start Date
              </label>

              <input
                id="backtest-start-date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
                className={inputClass}
                required
              />
            </div>

            {/* End date */}
            <div className="min-w-0">
              <label
                htmlFor="backtest-end-date"
                className={`${labelClass} flex items-center gap-2`}
              >
                <CalendarDays size={15} />
                End Date
              </label>

              <input
                id="backtest-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Form buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {loading ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play size={17} />
                  Run Backtest
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30"
        >
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              Backtest Failed
            </p>

            <p className="mt-1 break-words text-sm leading-5 text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Loading backtest results"
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Result heading */}
          <div className="mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Backtest Results
                </h2>

                <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                  {result.symbol || symbol} •{' '}
                  {result.strategy || strategyNames[strategy]}
                </p>
              </div>

              <div className="w-fit max-w-full rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {startDate} → {endDate}
              </div>
            </div>
          </div>

          {/* Main metrics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Initial capital */}
            <div className={cardClass}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Initial Capital
                </p>

                <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <Activity size={18} className="text-slate-600 dark:text-slate-300" />
                </div>
              </div>

              <p className="mt-3 break-words text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(result.initialCapital)}
              </p>
            </div>

            {/* Final capital */}
            <div className={cardClass}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Final Capital
                </p>

                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                  <Target size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <p className="mt-3 break-words text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(result.finalCapital)}
              </p>
            </div>

            {/* Total return */}
            <div className={cardClass}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Return
                </p>

                <div
                  className={`rounded-lg p-2 ${
                    Number(result.totalReturn) >= 0
                      ? 'bg-green-50 dark:bg-green-900/30'
                      : 'bg-red-50 dark:bg-red-900/30'
                  }`}
                >
                  {Number(result.totalReturn) >= 0 ? (
                    <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown size={18} className="text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>

              <p className={`mt-3 break-words text-xl font-bold ${getReturnColor(result.totalReturn)}`}>
                {formatPercent(result.totalReturn)}
              </p>
            </div>

            {/* Total trades */}
            <div className={cardClass}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Trades
                </p>

                <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
                  <Activity size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>

              <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                {result.totalTrades ?? 0}
              </p>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Win Rate
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {formatPercent(result.winRate)}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {result.winningTrades ?? 0} winning trades
              </p>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Profit / Loss
              </p>

              <p className={`mt-2 break-words text-xl font-bold ${getReturnColor(result.totalProfitLoss)}`}>
                {formatCurrency(result.totalProfitLoss)}
              </p>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Profit Factor
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {result.profitFactor !== null &&
                result.profitFactor !== undefined &&
                Number.isFinite(Number(result.profitFactor))
                  ? Number(result.profitFactor).toFixed(2)
                  : '--'}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Gross profit / gross loss
              </p>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Max Drawdown
              </p>

              <p className="mt-2 break-words text-xl font-bold text-red-600 dark:text-red-400">
                {formatPercent(result.maxDrawdown)}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Maximum portfolio decline
              </p>
            </div>
          </div>

          {/* Average profit and loss */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Average Profit
              </p>

              <p className="mt-2 break-words text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(result.averageProfit)}
              </p>
            </div>

            <div className={cardClass}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Average Loss
              </p>

              <p className="mt-2 break-words text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(result.averageLoss)}
              </p>
            </div>
          </div>

          {/* Trade history */}
          <section className="mt-6 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Trade History
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Entry and exit trades generated by the selected strategy.
              </p>
            </div>

            {Array.isArray(result.trades) && result.trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Action
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Price
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Profit / Loss
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.trades.map((trade, index) => (
                      <tr
                        key={`${trade.tradeDate}-${trade.action}-${index}`}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {trade.tradeDate || '--'}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTradeColor(trade.action)}`}>
                            {trade.action || '--'}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(trade.price)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {trade.quantity ?? '--'}
                        </td>

                        <td className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold ${getReturnColor(trade.profitLoss)}`}>
                          {formatCurrency(trade.profitLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Activity
                  size={24}
                  className="mx-auto text-slate-400 dark:text-slate-500"
                />

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No trades were generated during this period.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Initial state */}
      {!result && !loading && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Activity size={24} className="text-slate-500 dark:text-slate-400" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Run a Backtest
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Select a stock, strategy, date range and initial capital,
            then run the backtest to view performance and trade history.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          Backtest results are based on historical data and the selected
          strategy rules. Past performance does not guarantee future results.
          This tool is intended for analysis and educational purposes only.
        </p>
      </div>
    </div>
  )
}

export default Backtesting
