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

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await api.get(
        `/api/backtests/${symbol.toUpperCase()}/${strategy}`,
        {
          params: {
            startDate,
            endDate,
            initialCapital: Number(initialCapital),
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
    setSymbol('RELIANCE')
    setStrategy('rsi')
    setStartDate('2026-05-01')
    setEndDate('2026-09-01')
    setInitialCapital('100000')
    setResult(null)
    setError('')
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return '--'
    }

    return `₹${Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatPercent = (value) => {
    if (value === null || value === undefined) {
      return '--'
    }

    return `${Number(value).toFixed(2)}%`
  }

  const getReturnColor = (value) => {
    if (Number(value) > 0) {
      return 'text-green-600'
    }

    if (Number(value) < 0) {
      return 'text-red-600'
    }

    return 'text-slate-700'
  }

  const getTradeColor = (action) => {
    return action === 'BUY'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
  }

  return (
    <div className="p-4 sm:p-6">

      
{/* Header */}
<div className="-mx-4 -mt-4 mb-6 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-5 lg:-mx-8 lg:-mt-8 lg:px-8">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    {/* Page title */}
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Backtesting
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Test trading strategies against historical market data
      </p>
    </div>

    {/* Right-side actions */}
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <RefreshCw size={16} />
        Reset
      </button>

      <Navbar />
    </div>
  </div>
</div>


      {/* Backtest configuration */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Backtest Configuration
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a strategy and historical period to evaluate its performance.
          </p>
        </div>

        <form onSubmit={runBacktest}>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Stock Symbol
              </label>

              <input
                type="text"
                value={symbol}
                onChange={(e) =>
                  setSymbol(e.target.value.toUpperCase())
                }
                placeholder="RELIANCE"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            {/* Strategy */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Strategy
              </label>

              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="rsi">RSI Strategy</option>
                <option value="ema-crossover">
                  EMA Crossover
                </option>
                <option value="macd">
                  MACD Crossover
                </option>
                <option value="bollinger">
                  Bollinger Bands
                </option>
              </select>
            </div>

            {/* Initial capital */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Initial Capital
              </label>

              <input
                type="number"
                min="1"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            {/* Start date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={15} />
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            {/* End date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDays size={15} />
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
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
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>

          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Backtest Failed
            </p>

            <p className="mt-1 text-sm leading-5 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Result heading */}
          <div className="mb-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Backtest Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {result.symbol} •{' '}
                  {result.strategy ||
                    strategyNames[strategy]}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                {startDate} → {endDate}
              </div>

            </div>
          </div>

          {/* Main metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Initial capital */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Initial Capital
                </p>

                <div className="rounded-lg bg-slate-100 p-2">
                  <Activity size={18} className="text-slate-600" />
                </div>
              </div>

              <p className="mt-3 text-xl font-bold text-slate-900">
                {formatCurrency(result.initialCapital)}
              </p>
            </div>

            {/* Final capital */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Final Capital
                </p>

                <div className="rounded-lg bg-blue-50 p-2">
                  <Target size={18} className="text-blue-600" />
                </div>
              </div>

              <p className="mt-3 text-xl font-bold text-slate-900">
                {formatCurrency(result.finalCapital)}
              </p>
            </div>

            {/* Total return */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Total Return
                </p>

                <div
                  className={`rounded-lg p-2 ${
                    Number(result.totalReturn) >= 0
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}
                >
                  {Number(result.totalReturn) >= 0 ? (
                    <TrendingUp
                      size={18}
                      className="text-green-600"
                    />
                  ) : (
                    <TrendingDown
                      size={18}
                      className="text-red-600"
                    />
                  )}
                </div>
              </div>

              <p
                className={`mt-3 text-xl font-bold ${getReturnColor(
                  result.totalReturn
                )}`}
              >
                {formatPercent(result.totalReturn)}
              </p>
            </div>

            {/* Total trades */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Total Trades
                </p>

                <div className="rounded-lg bg-purple-50 p-2">
                  <Activity
                    size={18}
                    className="text-purple-600"
                  />
                </div>
              </div>

              <p className="mt-3 text-xl font-bold text-slate-900">
                {result.totalTrades ?? 0}
              </p>
            </div>

          </div>

          {/* Performance metrics */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Win Rate
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatPercent(result.winRate)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {result.winningTrades ?? 0} winning trades
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Profit / Loss
              </p>

              <p
                className={`mt-2 text-xl font-bold ${getReturnColor(
                  result.totalProfitLoss
                )}`}
              >
                {formatCurrency(result.totalProfitLoss)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Profit Factor
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {result.profitFactor !== null &&
                result.profitFactor !== undefined
                  ? Number(result.profitFactor).toFixed(2)
                  : '--'}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Gross profit / gross loss
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Max Drawdown
              </p>

              <p className="mt-2 text-xl font-bold text-red-600">
                {formatPercent(result.maxDrawdown)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Maximum portfolio decline
              </p>
            </div>

          </div>

          {/* Average profit / loss */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Average Profit
              </p>

              <p className="mt-2 text-lg font-bold text-green-600">
                {formatCurrency(result.averageProfit)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Average Loss
              </p>

              <p className="mt-2 text-lg font-bold text-red-600">
                {formatCurrency(result.averageLoss)}
              </p>
            </div>

          </div>

          {/* Trade history */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Trade History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Entry and exit trades generated by the selected strategy.
              </p>
            </div>

            {result.trades && result.trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Price
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Profit / Loss
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {result.trades.map((trade, index) => (
                      <tr
                        key={`${trade.tradeDate}-${trade.action}-${index}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {trade.tradeDate}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getTradeColor(
                              trade.action
                            )}`}
                          >
                            {trade.action}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {formatCurrency(trade.price)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {trade.quantity}
                        </td>

                        <td
                          className={`px-5 py-4 text-right text-sm font-semibold ${getReturnColor(
                            trade.profitLoss
                          )}`}
                        >
                          {formatCurrency(trade.profitLoss)}
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-500">
                  No trades were generated during this period.
                </p>
              </div>
            )}

          </div>

        </>
      )}

      {/* Initial state */}
      {!result && !loading && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Activity size={24} className="text-slate-500" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Run a Backtest
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Select a stock, strategy, date range and initial capital,
            then run the backtest to view performance and trade history.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs leading-5 text-slate-500">
          Backtest results are based on historical data and the selected
          strategy rules. Past performance does not guarantee future results
          and this tool is intended for analysis and educational purposes only.
        </p>
      </div>

    </div>
  )
}

export default Backtesting