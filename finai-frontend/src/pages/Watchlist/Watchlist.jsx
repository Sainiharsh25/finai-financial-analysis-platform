import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Navbar from '../../pages/Navbar/Navbar'
function Watchlist() {
  const navigate = useNavigate()

  const [stocks, setStocks] = useState([])
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stockToRemove, setStockToRemove] = useState(null)

  const fetchWatchlist = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await api.get('/api/watchlist')
      setStocks(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Fetch watchlist error:', err)

      setError(
        err.response?.data?.message ||
          'Unable to load your watchlist. Please try again.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  const handleAddStock = async (e) => {
    e.preventDefault()

    const stockSymbol = symbol.trim().toUpperCase()

    if (!stockSymbol) {
      setError('Please enter a stock symbol.')
      return
    }

    try {
      setAdding(true)
      setError('')
      setSuccess('')

      await api.post('/api/watchlist', {
        symbol: stockSymbol,
      })

      setSymbol('')
      setSuccess(`${stockSymbol} added to your watchlist.`)

      await fetchWatchlist()
    } catch (err) {
      console.error('Add watchlist stock error:', err)

      setError(
        err.response?.data?.message ||
          `Unable to add ${stockSymbol}. Check that the stock exists in your database and is not already in your watchlist.`
      )
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveStock = async () => {
    if (!stockToRemove) return

    const stockSymbol = stockToRemove.symbol

    try {
      setRemoving(true)
      setError('')
      setSuccess('')

      await api.delete(`/api/watchlist/${encodeURIComponent(stockSymbol)}`)

      setStockToRemove(null)
      setSuccess(`${stockSymbol} removed from your watchlist.`)

      await fetchWatchlist()
    } catch (err) {
      console.error('Remove watchlist stock error:', err)

      setError(
        err.response?.data?.message ||
          `Unable to remove ${stockSymbol}. Please try again.`
      )
    } finally {
      setRemoving(false)
    }
  }

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') {
      return '—'
    }

    const number = Number(value)

    if (!Number.isFinite(number)) return '—'

    return `₹${number.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatChange = (value) => {
    const number = Number(value)

    if (!Number.isFinite(number)) return '—'

    return `${number > 0 ? '+' : ''}${number.toFixed(2)}%`
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
     
{/* Header */}
<div className="-mx-4 -mt-4 mb-8 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    {/* Page title */}
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Watchlist
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Track stocks and monitor their latest stored prices.
      </p>
    </div>

    {/* Right-side actions */}
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => fetchWatchlist(true)}
        disabled={loading || refreshing}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <RefreshCw
          size={16}
          className={refreshing ? 'animate-spin' : ''}
        />
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>

      <Navbar />
    </div>
  </div>
</div>


      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess('')}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Add stock */}
      <form
        onSubmit={handleAddStock}
        className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-3">
          <h2 className="font-semibold text-slate-900">
            Add a stock
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter a symbol already registered in your FinAI database.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE, TCS, INFY"
              aria-label="Stock symbol"
              maxLength={30}
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-base uppercase outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={adding || !symbol.trim()}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? 'Adding...' : 'Add to Watchlist'}
          </button>
        </div>
      </form>

      {/* Watchlist table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            My Watchlist
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? 'Loading your stocks...'
              : `${stocks.length} ${stocks.length === 1 ? 'stock' : 'stocks'} currently being tracked`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : stocks.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search size={22} className="text-slate-500" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              Your watchlist is empty
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add a stock above to start tracking it.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile stock cards */}
            <div className="space-y-3 md:hidden">
              {stocks.map((stock) => {
                const change = Number(stock.changePercent ?? 0)
                const isPositive = change >= 0

                return (
                  <div
                    key={stock.symbol}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {stock.symbol}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {stock.companyName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStockToRemove(stock)}
                        aria-label={`Remove ${stock.symbol}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Latest close</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatPrice(stock.currentPrice)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Change vs previous close
                        </p>
                        <p
                          className={`mt-1 inline-flex items-center gap-1 font-semibold ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight size={15} />
                          ) : (
                            <ArrowDownRight size={15} />
                          )}
                          {formatChange(stock.changePercent)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/analysis?symbol=${encodeURIComponent(stock.symbol)}`
                        )
                      }
                      className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Analyze stock
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Latest Close</th>
                    <th className="px-4 py-3 font-medium">
                      Change vs Previous Close
                    </th>
                    <th className="px-4 py-3 font-medium">Exchange</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stocks.map((stock) => {
                    const change = Number(stock.changePercent ?? 0)
                    const isPositive = change >= 0

                    return (
                      <tr
                        key={stock.symbol}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {stock.symbol}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {stock.companyName}
                          </p>
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-900">
                          {formatPrice(stock.currentPrice)}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowDownRight size={16} />
                            )}
                            {formatChange(stock.changePercent)}
                          </span>
                          <p className="mt-1 text-xs text-slate-500">
                            {Number(stock.priceChange) > 0 ? '+' : ''}
                            {formatPrice(stock.priceChange)}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {stock.exchange || '—'}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/analysis?symbol=${encodeURIComponent(stock.symbol)}`
                                )
                              }
                              className="font-medium text-slate-700 hover:text-slate-950"
                            >
                              Analyze
                            </button>

                            <button
                              type="button"
                              onClick={() => setStockToRemove(stock)}
                              title={`Remove ${stock.symbol}`}
                              aria-label={`Remove ${stock.symbol}`}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Remove confirmation modal */}
      {stockToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !removing) {
              setStockToRemove(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-watchlist-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={20} className="text-red-600" />
              </div>

              <div>
                <h2
                  id="remove-watchlist-title"
                  className="font-semibold text-slate-900"
                >
                  Remove {stockToRemove.symbol}?
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  This will remove the stock from your watchlist. It will not
                  delete your stock data or portfolio holding.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStockToRemove(null)}
                disabled={removing}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemoveStock}
                disabled={removing}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {removing ? 'Removing...' : 'Remove stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Watchlist