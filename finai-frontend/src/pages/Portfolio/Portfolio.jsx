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

  // --------------------------------------------------
  // Fetch portfolio
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const isProfit = (value) => Number(value || 0) >= 0

  // --------------------------------------------------
  // Add Holding
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Delete Holding
  // --------------------------------------------------

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

  return (
    <div className="p-4 sm:p-6">

      {/* =========================================================
          Add Holding Modal
      ========================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Holding
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a stock to your portfolio
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={adding}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddHolding}>

              <div className="space-y-4 p-5">

                {formError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">
                      {formError}
                    </p>
                  </div>
                )}

                {/* Symbol */}

                <div>
                  <label
                    htmlFor="symbol"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Quantity */}

                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Average Buy Price */}

                <div>
                  <label
                    htmlFor="averageBuyPrice"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 p-5">

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={adding}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {adding ? 'Adding...' : 'Add Holding'}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          Delete Confirmation Modal
      ========================================================= */}

      {showDeleteModal && holdingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">

            <div className="p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle
                    size={22}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Remove Holding?
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Are you sure you want to remove{' '}
                    <span className="font-semibold text-slate-700">
                      {holdingToDelete.symbol}
                    </span>{' '}
                    from your portfolio?
                  </p>
                </div>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteHolding}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {deleting ? 'Removing...' : 'Remove'}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Header */}
<div className="-mx-4 -mt-4 mb-6 border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-5">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    {/* Page title */}
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Portfolio
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Track your holdings and portfolio performance
      </p>
    </div>

    {/* Right-side actions */}
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => fetchPortfolio(true)}
        disabled={refreshing}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        <Plus size={17} />
        Add Holding
      </button>

      <Navbar />
    </div>
  </div>
</div>

      {/* =========================================================
          Error
      ========================================================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load portfolio
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* =========================================================
          Loading
      ========================================================= */}

      {loading ? (

        <div className="space-y-6">

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}

          </div>

          <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />

        </div>

      ) : (

        <>

          {/* =====================================================
              Summary
          ===================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Portfolio Value */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Portfolio Value
                </p>

                <div className="rounded-lg bg-blue-50 p-2">
                  <Briefcase
                    size={18}
                    className="text-blue-600"
                  />
                </div>

              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                ₹{formatCurrency(portfolioSummary.totalValue)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Current market value
              </p>

            </div>

            {/* Invested Value */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Invested Value
                </p>

                <div className="rounded-lg bg-slate-100 p-2">
                  <PieChart
                    size={18}
                    className="text-slate-600"
                  />
                </div>

              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                ₹{formatCurrency(portfolioSummary.investedValue)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Total amount invested
              </p>

            </div>

            {/* P&L */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Total P&amp;L
                </p>

                <div
                  className={`rounded-lg p-2 ${
                    isProfit(portfolioSummary.totalProfitLoss)
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}
                >
                  {isProfit(portfolioSummary.totalProfitLoss) ? (
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
                className={`mt-3 text-2xl font-bold ${
                  isProfit(portfolioSummary.totalProfitLoss)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {isProfit(portfolioSummary.totalProfitLoss)
                  ? '+'
                  : '-'}
                ₹
                {formatCurrency(
                  Math.abs(portfolioSummary.totalProfitLoss)
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Overall unrealized profit/loss
              </p>

            </div>

            {/* Return */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Total Return
                </p>

                <div
                  className={`rounded-lg p-2 ${
                    isProfit(portfolioSummary.totalReturn)
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}
                >
                  {isProfit(portfolioSummary.totalReturn) ? (
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
                className={`mt-3 text-2xl font-bold ${
                  isProfit(portfolioSummary.totalReturn)
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {isProfit(portfolioSummary.totalReturn)
                  ? '+'
                  : ''}
                {Number(
                  portfolioSummary.totalReturn || 0
                ).toFixed(2)}
                %
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Return on invested capital
              </p>

            </div>

          </div>

          {/* =====================================================
              Holdings
          ===================================================== */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Holdings
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your current stock positions
                </p>

              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {portfolioSummary.totalHoldings} Stocks
              </span>

            </div>

            {holdings.length === 0 ? (

              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

                <div className="rounded-full bg-slate-100 p-4">
                  <Briefcase
                    size={28}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  No holdings yet
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Add a stock holding to start tracking your portfolio.
                </p>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <Plus size={17} />
                  Add Holding
                </button>

              </div>

            ) : (

              <>

                {/* =================================================
                    Desktop
                ================================================= */}

                <div className="hidden overflow-x-auto md:block">

                  <table className="w-full text-left">

                    <thead className="border-b border-slate-200 bg-slate-50">

                      <tr>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Stock
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Quantity
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Avg. Price
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Current Price
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Current Value
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          P&amp;L
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Return
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {holdings.map((holding) => (

                        <tr
                          key={holding.symbol}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-slate-900">
                              {holding.symbol}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {holding.companyName}
                            </p>

                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {holding.quantity}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            ₹{formatCurrency(holding.averageBuyPrice)}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-800">
                            ₹{formatCurrency(holding.currentPrice)}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-800">
                            ₹{formatCurrency(holding.currentValue)}
                          </td>

                          <td className="px-5 py-4">

                            <p
                              className={`text-sm font-semibold ${
                                isProfit(holding.profitLoss)
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {isProfit(holding.profitLoss)
                                ? '+'
                                : '-'}
                              ₹
                              {formatCurrency(
                                Math.abs(holding.profitLoss)
                              )}
                            </p>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isProfit(holding.returnPercent)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {isProfit(holding.returnPercent)
                                ? '+'
                                : ''}
                              {Number(
                                holding.returnPercent || 0
                              ).toFixed(2)}
                              %
                            </span>

                          </td>

                          {/* Delete */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(holding)
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title={`Remove ${holding.symbol}`}
                            >
                              <Trash2 size={18} />
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

                {/* =================================================
                    Mobile
                ================================================= */}

                <div className="divide-y divide-slate-100 md:hidden">

                  {holdings.map((holding) => (

                    <div
                      key={holding.symbol}
                      className="p-5"
                    >

                      <div className="flex items-start justify-between">

                        <div>

                          <p className="font-semibold text-slate-900">
                            {holding.symbol}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {holding.companyName}
                          </p>

                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isProfit(holding.returnPercent)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isProfit(holding.returnPercent)
                            ? '+'
                            : ''}
                          {Number(
                            holding.returnPercent || 0
                          ).toFixed(2)}
                          %
                        </span>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">

                        <div>
                          <p className="text-xs text-slate-500">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {holding.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Current Price
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            ₹{formatCurrency(holding.currentPrice)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Avg. Price
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            ₹{formatCurrency(holding.averageBuyPrice)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Invested
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            ₹{formatCurrency(holding.investedValue)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Current Value
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            ₹{formatCurrency(holding.currentValue)}
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                        <div>

                          <p className="text-xs text-slate-500">
                            Profit / Loss
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${
                              isProfit(holding.profitLoss)
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {isProfit(holding.profitLoss)
                              ? '+'
                              : '-'}
                            ₹
                            {formatCurrency(
                              Math.abs(holding.profitLoss)
                            )}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(holding)
                          }
                          className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
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

          {/* =====================================================
              Disclaimer
          ===================================================== */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <p className="text-xs leading-5 text-slate-500">
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