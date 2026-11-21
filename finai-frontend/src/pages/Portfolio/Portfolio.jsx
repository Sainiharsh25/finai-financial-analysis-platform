import { useEffect, useState } from 'react'

import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Plus,
  PieChart,
  RefreshCw,
  AlertCircle,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

import api from '../../services/api'
import Navbar from '../../pages/Navbar/Navbar'

function Portfolio() {
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    investedValue: 0,
    totalProfitLoss: 0,
    totalReturn: 0,
    totalHoldings: 0,
  })

  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Add holding
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    averageBuyPrice: '',
  })

  // Delete holding
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [holdingToDelete, setHoldingToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch portfolio
  const fetchPortfolio = async (showRefresh = false) => {
    try {
      setError('')

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [summaryResponse, holdingsResponse] = await Promise.all([
        api.get('/api/portfolio/summary'),
        api.get('/api/portfolio/holdings'),
      ])

      setPortfolioSummary(summaryResponse.data)
      setHoldings(holdingsResponse.data)
    } catch (error) {
      console.error('Portfolio API error:', error)

      setError(
        error.response?.data?.message ||
          'Unable to load portfolio data.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  // Helpers
  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const isProfit = (value) => Number(value || 0) >= 0

  // Add holding
  const handleFormChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const openAddModal = () => {
    setFormError('')

    setFormData({
      symbol: '',
      quantity: '',
      averageBuyPrice: '',
    })

    setShowAddModal(true)
  }

  const closeAddModal = () => {
    if (adding) return

    setShowAddModal(false)
    setFormError('')
  }

  const handleAddHolding = async (e) => {
    e.preventDefault()
    setFormError('')

    const symbol = formData.symbol.trim().toUpperCase()
    const quantity = Number(formData.quantity)
    const averageBuyPrice = Number(formData.averageBuyPrice)

    if (!symbol) {
      setFormError('Please enter a stock symbol.')
      return
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setFormError('Quantity must be a positive whole number.')
      return
    }

    if (!Number.isFinite(averageBuyPrice) || averageBuyPrice <= 0) {
      setFormError('Average buy price must be greater than 0.')
      return
    }

    try {
      setAdding(true)

      await api.post('/api/portfolio/holdings', {
        symbol,
        quantity,
        averageBuyPrice,
      })

      setShowAddModal(false)

      setFormData({
        symbol: '',
        quantity: '',
        averageBuyPrice: '',
      })

      await fetchPortfolio(true)
    } catch (error) {
      console.error('Add holding error:', error)

      setFormError(
        error.response?.data?.message ||
          'Unable to add holding. Make sure the stock exists in FinAI.'
      )
    } finally {
      setAdding(false)
    }
  }

  // Delete holding
  const openDeleteModal = (holding) => {
    setHoldingToDelete(holding)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    if (deleting) return

    setShowDeleteModal(false)
    setHoldingToDelete(null)
  }

  const handleDeleteHolding = async () => {
    if (!holdingToDelete) return

    try {
      setDeleting(true)
      setError('')

      await api.delete(
        `/api/portfolio/holdings/${holdingToDelete.symbol}`
      )

      setShowDeleteModal(false)
      setHoldingToDelete(null)

      await fetchPortfolio(true)
    } catch (error) {
      console.error('Delete holding error:', error)

      setError(
        error.response?.data?.message ||
          `Unable to remove ${holdingToDelete.symbol} from your portfolio.`
      )
    } finally {
      setDeleting(false)
    }
  }

  const inputClass =
    'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40'

  const modalButtonClass =
    'min-h-11 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="min-w-0 w-full p-3 sm:p-5 lg:p-6">
      {/* Add Holding Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4"
          onClick={closeAddModal}
        >
          <div
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Add Holding
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add a stock to your portfolio
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={adding}
                aria-label="Close add holding dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddHolding}>
              <div className="space-y-4 p-4 sm:p-5">
                {formError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30"
                  >
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {formError}
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="symbol"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Stock Symbol
                  </label>

                  <input
                    id="symbol"
                    name="symbol"
                    type="text"
                    value={formData.symbol}
                    onChange={handleFormChange}
                    placeholder="e.g. RELIANCE"
                    autoComplete="off"
                    className={`${inputClass} uppercase`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="e.g. 10"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="averageBuyPrice"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Average Buy Price
                  </label>

                  <input
                    id="averageBuyPrice"
                    name="averageBuyPrice"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.averageBuyPrice}
                    onChange={handleFormChange}
                    placeholder="e.g. 1285.50"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:gap-3 sm:p-5">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={adding}
                  className={`${modalButtonClass} border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className={`${modalButtonClass} flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500`}
                >
                  {adding && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}

                  {adding ? 'Adding...' : 'Add Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && holdingToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="my-auto w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                  <AlertTriangle
                    size={22}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Remove Holding?
                  </h2>

                  <p className="mt-1 break-words text-sm leading-5 text-slate-500 dark:text-slate-400">
                    Are you sure you want to remove{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {holdingToDelete.symbol}
                    </span>{' '}
                    from your portfolio?
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className={`${modalButtonClass} border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteHolding}
                  disabled={deleting}
                  className={`${modalButtonClass} flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700`}
                >
                  {deleting && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}

                  {deleting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="-mx-3 -mt-3 mb-5 border-b border-slate-200 bg-white px-3 py-4 dark:border-slate-800 dark:bg-slate-900 sm:-mx-5 sm:-mt-5 sm:mb-6 sm:px-5 sm:py-5 lg:-mx-6 lg:-mt-6 lg:px-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Portfolio
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Track your holdings and portfolio performance
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <button
              type="button"
              onClick={() => fetchPortfolio(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none sm:px-4"
            >
              <RefreshCw
                size={17}
                className={refreshing ? 'animate-spin' : ''}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 sm:flex-none sm:px-4"
            >
              <Plus size={17} />
              Add Holding
            </button>

            <div className="ml-auto sm:ml-0">
              <Navbar />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30 sm:mb-6 sm:p-4"
        >
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Unable to load portfolio
            </p>

            <p className="mt-1 break-words text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:h-36"
              />
            ))}
          </div>

          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:h-80" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {/* Portfolio Value */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Portfolio Value
                </p>

                <div className="shrink-0 rounded-lg bg-blue-50 p-2 dark:bg-blue-950/40">
                  <Briefcase size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <p className="mt-3 break-words text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                ₹{formatCurrency(portfolioSummary.totalValue)}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Current market value
              </p>
            </div>

            {/* Invested Value */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Invested Value
                </p>

                <div className="shrink-0 rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                  <PieChart size={18} className="text-slate-600 dark:text-slate-300" />
                </div>
              </div>

              <p className="mt-3 break-words text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                ₹{formatCurrency(portfolioSummary.investedValue)}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Total amount invested
              </p>
            </div>

            {/* P&L */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total P&amp;L
                </p>

                <div
                  className={`shrink-0 rounded-lg p-2 ${
                    isProfit(portfolioSummary.totalProfitLoss)
                      ? 'bg-green-50 dark:bg-green-950/40'
                      : 'bg-red-50 dark:bg-red-950/40'
                  }`}
                >
                  {isProfit(portfolioSummary.totalProfitLoss) ? (
                    <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown size={18} className="text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>

              <p
                className={`mt-3 break-words text-xl font-bold sm:text-2xl ${
                  isProfit(portfolioSummary.totalProfitLoss)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isProfit(portfolioSummary.totalProfitLoss) ? '+' : '-'}₹
                {formatCurrency(Math.abs(portfolioSummary.totalProfitLoss))}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Overall unrealized profit/loss
              </p>
            </div>

            {/* Return */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Return
                </p>

                <div
                  className={`shrink-0 rounded-lg p-2 ${
                    isProfit(portfolioSummary.totalReturn)
                      ? 'bg-green-50 dark:bg-green-950/40'
                      : 'bg-red-50 dark:bg-red-950/40'
                  }`}
                >
                  {isProfit(portfolioSummary.totalReturn) ? (
                    <TrendingUp size={18} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown size={18} className="text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>

              <p
                className={`mt-3 break-words text-xl font-bold sm:text-2xl ${
                  isProfit(portfolioSummary.totalReturn)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isProfit(portfolioSummary.totalReturn) ? '+' : ''}
                {Number(portfolioSummary.totalReturn || 0).toFixed(2)}%
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Return on invested capital
              </p>
            </div>
          </div>

          {/* Holdings */}
          <div className="mt-5 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:mt-6">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Holdings
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your current stock positions
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {portfolioSummary.totalHoldings} Stocks
              </span>
            </div>

            {holdings.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-14 text-center sm:py-16">
                <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <Briefcase size={28} className="text-slate-400" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                  No holdings yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Add a stock holding to start tracking your portfolio.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  <Plus size={17} />
                  Add Holding
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Holdings Table */}
                <div className="hidden w-full overflow-x-auto md:block">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                      <tr>
                        {[
                          'Stock',
                          'Quantity',
                          'Avg. Price',
                          'Current Price',
                          'Current Value',
                          'P&L',
                          'Return',
                          'Action',
                        ].map((heading) => (
                          <th
                            key={heading}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
                              heading === 'Return' || heading === 'Action'
                                ? 'text-right'
                                : ''
                            }`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {holdings.map((holding) => (
                        <tr
                          key={holding.symbol}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-4 py-4">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {holding.symbol}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {holding.companyName}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {holding.quantity}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                            ₹{formatCurrency(holding.averageBuyPrice)}
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                            ₹{formatCurrency(holding.currentPrice)}
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                            ₹{formatCurrency(holding.currentValue)}
                          </td>

                          <td className="px-4 py-4">
                            <p
                              className={`text-sm font-semibold ${
                                isProfit(holding.profitLoss)
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {isProfit(holding.profitLoss) ? '+' : '-'}₹
                              {formatCurrency(Math.abs(holding.profitLoss))}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isProfit(holding.returnPercent)
                                  ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                              }`}
                            >
                              {isProfit(holding.returnPercent) ? '+' : ''}
                              {Number(holding.returnPercent || 0).toFixed(2)}%
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openDeleteModal(holding)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              title={`Remove ${holding.symbol}`}
                              aria-label={`Remove ${holding.symbol}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Holdings Cards */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                  {holdings.map((holding) => (
                    <div
                      key={holding.symbol}
                      className="min-w-0 p-4 sm:p-5"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words font-semibold text-slate-900 dark:text-white">
                            {holding.symbol}
                          </p>

                          <p className="mt-0.5 break-words text-xs text-slate-500 dark:text-slate-400">
                            {holding.companyName}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isProfit(holding.returnPercent)
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                          }`}
                        >
                          {isProfit(holding.returnPercent) ? '+' : ''}
                          {Number(holding.returnPercent || 0).toFixed(2)}%
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Quantity
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {holding.quantity}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Current Price
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                            ₹{formatCurrency(holding.currentPrice)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Avg. Price
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                            ₹{formatCurrency(holding.averageBuyPrice)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Invested
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                            ₹{formatCurrency(holding.investedValue)}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Current Value
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
                            ₹{formatCurrency(holding.currentValue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Profit / Loss
                          </p>

                          <p
                            className={`mt-1 break-words text-sm font-semibold ${
                              isProfit(holding.profitLoss)
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isProfit(holding.profitLoss) ? '+' : '-'}₹
                            {formatCurrency(Math.abs(holding.profitLoss))}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(holding)}
                          className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                          aria-label={`Remove ${holding.symbol}`}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-4">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Portfolio values are calculated from your holdings and the
              latest available historical market price stored in the FinAI
              backend.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default Portfolio