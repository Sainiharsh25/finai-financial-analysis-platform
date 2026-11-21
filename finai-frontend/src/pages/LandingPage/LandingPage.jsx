import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  ShieldCheck,
  Wallet,
  Activity,
  TrendingUp,
  Menu,
  X,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePreferences } from '../../hooks/PreferencesContext'

const features = [
  {
    icon: ChartNoAxesCombined,
    title: 'Smart Market Analysis',
    description:
      'Analyze stock movements with technical indicators and market data.',
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered Insights',
    description:
      'Explore financial insights and make more informed investment decisions.',
  },
  {
    icon: Wallet,
    title: 'Portfolio Tracking',
    description:
      'Monitor your investments, portfolio performance and profit or loss.',
  },
  {
    icon: Activity,
    title: 'Trading Strategies',
    description:
      'Explore RSI, MACD, EMA and Bollinger Band trading signals.',
  },
]

const benefits = [
  'Track your investments in one place',
  'Analyze stocks using technical indicators',
  'Monitor historical portfolio performance',
  'Explore AI-powered financial insights',
]

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { preferences, toggleDarkMode } = usePreferences()
  const isDark = preferences.darkMode

  const closeMenu = () => setMenuOpen(false)

  const theme = {
    page: isDark
      ? 'bg-[#080d19] text-white'
      : 'bg-slate-50 text-slate-900',
    header: isDark
      ? 'border-white/10 bg-[#080d19]/90'
      : 'border-slate-200 bg-white/90',
    muted: isDark ? 'text-slate-400' : 'text-slate-600',
    navText: isDark ? 'text-slate-300' : 'text-slate-700',
    section: isDark ? 'bg-[#0b1220]' : 'bg-slate-100',
    card: isDark
      ? 'border-white/10 bg-[#101a2b]'
      : 'border-slate-200 bg-white shadow-lg shadow-slate-200/50',
    innerCard: isDark
      ? 'border-white/10 bg-[#0b1423]'
      : 'border-slate-200 bg-slate-50',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    footer: isDark ? 'bg-[#060a12]' : 'bg-white',
    mobileMenu: isDark ? 'bg-[#0b1220]' : 'bg-white',
  }

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${theme.page}`}
    >
      <style>{`
        @keyframes ship-fly {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-7deg);
          }
          50% {
            transform: translate3d(28px, -24px, 35px) rotate(2deg);
          }
        }

        @keyframes ship-fly-two {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(8deg);
          }
          50% {
            transform: translate3d(-22px, 18px, 25px) rotate(-3deg);
          }
        }

        @keyframes star-drift {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-45px, 35px, 0);
          }
        }

        @keyframes orbit-spin {
          from {
            transform: rotateX(65deg) rotateZ(0deg);
          }
          to {
            transform: rotateX(65deg) rotateZ(360deg);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: .35;
          }
          50% {
            opacity: .8;
          }
        }

        .spaceship-one {
          animation: ship-fly 8s ease-in-out infinite;
        }

        .spaceship-two {
          animation: ship-fly-two 11s ease-in-out infinite;
        }

        .star-layer {
          animation: star-drift 24s linear infinite alternate;
        }

        .orbit-ring {
          animation: orbit-spin 22s linear infinite;
        }

        .engine-glow {
          animation: glow-pulse 1.5s ease-in-out infinite;
        }

        .space-scene {
          perspective: 900px;
          transform-style: preserve-3d;
        }

        @media (max-width: 639px) {
          .space-scene {
            perspective: 700px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .spaceship-one,
          .spaceship-two,
          .star-layer,
          .orbit-ring,
          .engine-glow {
            animation: none !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <header
        className={`relative z-50 border-b backdrop-blur-xl transition-colors ${theme.header}`}
      >
        <nav className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 sm:gap-3"
            onClick={closeMenu}
          >
            <div className="rounded-xl bg-cyan-400 p-2 text-slate-950 sm:p-2.5">
              <TrendingUp size={22} />
            </div>

            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              Fin<span className="text-blue-500">AI</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div
            className={`hidden items-center gap-6 text-sm md:flex lg:gap-9 ${theme.navText}`}
          >
            <a
              href="#features"
              className="transition hover:text-cyan-400"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-cyan-400"
            >
              How it works
            </a>
            <a
              href="#about"
              className="transition hover:text-cyan-400"
            >
              About
            </a>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex lg:gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`rounded-xl border p-2.5 transition hover:border-cyan-400 hover:text-cyan-400 ${theme.border}`}
              aria-label="Toggle day and night mode"
              title="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <Link
              to="/login"
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-cyan-400/10 lg:px-5 ${theme.navText}`}
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 lg:px-5"
            >
              Get started
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Mobile actions */}
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border}`}
              aria-label="Toggle day and night mode"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${theme.border}`}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile navigation */}
        {menuOpen && (
          <div
            id="mobile-navigation"
            className={`border-t px-5 py-5 md:hidden ${theme.border} ${theme.mobileMenu}`}
          >
            <div className={`flex flex-col gap-5 text-sm ${theme.navText}`}>
              <a href="#features" onClick={closeMenu}>
                Features
              </a>
              <a href="#how-it-works" onClick={closeMenu}>
                How it works
              </a>
              <a href="#about" onClick={closeMenu}>
                About
              </a>
              <Link to="/login" onClick={closeMenu}>
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="rounded-xl bg-cyan-400 px-4 py-3 text-center font-bold text-slate-950"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

          <div className="relative mx-auto grid w-full max-w-7xl min-w-0 items-center gap-10 px-4 py-12 sm:gap-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-28">
            <div className="relative z-10 min-w-0">
              <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold tracking-wide text-cyan-500 sm:mb-7 sm:px-4 sm:text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                YOUR FINANCIAL INTELLIGENCE PLATFORM
              </div>

              <h1 className="max-w-2xl break-words text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Take control of your{' '}
                <span className="text-cyan-500">
                  financial future.
                </span>
              </h1>

              <p
                className={`mt-5 max-w-xl text-sm leading-7 sm:mt-7 sm:text-base sm:leading-8 lg:text-lg ${theme.muted}`}
              >
                Track your portfolio, analyze market trends and explore
                intelligent trading strategies — all in one place with FinAI.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
                <Link
                  to="/signup"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:px-7 sm:py-4 sm:text-base"
                >
                  Get started
                  <ArrowRight size={19} />
                </Link>

                <Link
                  to="/login"
                  className={`inline-flex min-h-12 items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition hover:border-cyan-400/50 hover:bg-cyan-400/5 sm:px-7 sm:py-4 sm:text-base ${theme.border}`}
                >
                  Sign in to FinAI
                </Link>
              </div>

              <div
                className={`mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs sm:mt-9 sm:gap-x-6 sm:text-sm ${theme.muted}`}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-cyan-500" />
                  Portfolio tracking
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-cyan-500" />
                  Technical analysis
                </span>
              </div>
            </div>

            {/* Animated 3D-style space scene */}
            <div className="space-scene relative mx-auto h-[300px] w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#071426] via-[#101b37] to-[#07101f] shadow-2xl shadow-cyan-900/20 sm:h-[420px] sm:rounded-[2rem] lg:h-[500px]">
              <div
                className="star-layer absolute inset-0 opacity-80"
                style={{
                  backgroundImage:
                    'radial-gradient(2px 2px at 20px 30px, #fff 98%, transparent), radial-gradient(1.5px 1.5px at 90px 80px, #67e8f9 98%, transparent), radial-gradient(2px 2px at 160px 150px, #fff 98%, transparent), radial-gradient(1px 1px at 240px 50px, #fff 98%, transparent), radial-gradient(2px 2px at 300px 190px, #67e8f9 98%, transparent)',
                  backgroundSize: '340px 240px',
                }}
              />

              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl sm:h-64 sm:w-64" />

              <div className="orbit-ring absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 sm:h-64 sm:w-64" />

              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/20 sm:h-48 sm:w-48" />

              {/* Planet */}
              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-200 via-blue-500 to-indigo-950 shadow-[0_0_65px_rgba(34,211,238,0.35)] sm:h-36 sm:w-36">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
                <div className="absolute -left-4 top-9 h-7 w-36 rotate-[-18deg] rounded-full border border-cyan-100/20 bg-cyan-200/10 blur-[1px] sm:-left-5 sm:top-12 sm:h-8 sm:w-44" />
              </div>

              {/* Spaceship 1 */}
              <div className="spaceship-one absolute left-[8%] top-[20%] z-10 sm:left-[13%]">
                <svg
                  viewBox="0 0 180 110"
                  className="w-24 drop-shadow-[0_10px_18px_rgba(34,211,238,0.4)] sm:w-36 lg:w-44"
                  role="img"
                  aria-label="Animated futuristic spaceship"
                >
                  <defs>
                    <linearGradient
                      id="shipBody"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#ecfeff" />
                      <stop offset="45%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#0e7490" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M18 58 L62 40 L115 12 L151 45 L173 55 L151 65 L115 98 L62 76 Z"
                    fill="#164e63"
                    opacity=".8"
                  />
                  <path
                    d="M10 55 Q78 4 160 54 Q78 106 10 55Z"
                    fill="url(#shipBody)"
                    stroke="#cffafe"
                    strokeWidth="2"
                  />
                  <path
                    d="M72 53 Q94 24 120 51 Q96 82 72 53Z"
                    fill="#083344"
                    stroke="#a5f3fc"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 55 L-3 55 L22 47 L22 63Z"
                    fill="#22d3ee"
                  />
                  <path
                    d="M20 53 L-8 55 L20 59Z"
                    fill="#67e8f9"
                    className="engine-glow"
                  />
                  <path
                    d="M55 37 L35 13 L89 35Z"
                    fill="#0e7490"
                  />
                  <path
                    d="M55 73 L35 97 L89 75Z"
                    fill="#0e7490"
                  />
                </svg>
              </div>

              {/* Spaceship 2 */}
              <div className="spaceship-two absolute bottom-[19%] right-[7%] z-10 sm:right-[9%]">
                <svg
                  viewBox="0 0 180 110"
                  className="w-20 drop-shadow-[0_8px_18px_rgba(59,130,246,0.5)] sm:w-24 lg:w-32"
                  role="img"
                  aria-label="Second animated spaceship"
                >
                  <path
                    d="M15 55 Q80 8 162 55 Q80 102 15 55Z"
                    fill="#93c5fd"
                    stroke="#dbeafe"
                    strokeWidth="2"
                  />
                  <path
                    d="M72 54 Q94 30 119 54 Q94 77 72 54Z"
                    fill="#172554"
                    stroke="#bfdbfe"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 55 L-8 55 L18 48 L18 62Z"
                    fill="#38bdf8"
                    className="engine-glow"
                  />
                </svg>
              </div>

              <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[9px] font-semibold text-cyan-100 backdrop-blur-md sm:left-6 sm:top-6 sm:px-4 sm:text-xs">
                FINAI · EXPLORE THE FUTURE
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3 text-[10px] text-cyan-100 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:px-4 sm:text-xs">
                <span>Intelligent finance</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Explore
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className={`scroll-mt-20 border-t py-16 sm:py-20 lg:py-24 ${theme.border} ${theme.section}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 sm:text-sm">
                Powerful features
              </p>

              <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Everything you need to understand your investments.
              </h2>

              <p className={`mt-4 text-sm leading-7 sm:mt-5 sm:text-base ${theme.muted}`}>
                A unified workspace for tracking, analyzing and understanding
                your financial activity.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className={`group min-w-0 rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 sm:p-6 ${theme.card}`}
                >
                  <div className="inline-flex rounded-xl bg-cyan-400/10 p-3 text-cyan-500 transition group-hover:bg-cyan-400 group-hover:text-slate-950">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 break-words text-lg font-semibold sm:mt-6">
                    {title}
                  </h3>

                  <p className={`mt-3 text-sm leading-7 ${theme.muted}`}>
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-9 px-4 sm:gap-14 sm:px-8 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 sm:text-sm">
                One platform. Better visibility.
              </p>

              <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Make your financial activity easier to understand.
              </h2>

              <p className={`mt-4 text-sm leading-7 sm:mt-5 sm:text-base sm:leading-8 ${theme.muted}`}>
                FinAI brings portfolio information, stock analysis and
                strategy signals together so you can explore your investments
                with greater clarity.
              </p>

              <Link
                to="/signup"
                className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-cyan-500 transition hover:text-cyan-400 sm:mt-8"
              >
                Explore FinAI
                <ArrowRight size={18} />
              </Link>
            </div>

            <div
              id="about"
              className={`scroll-mt-20 min-w-0 rounded-2xl border p-5 sm:rounded-3xl sm:p-9 ${theme.card}`}
            >
              <h3 className="text-xl font-bold">
                Your financial workspace
              </h3>

              <p className={`mt-2 text-sm ${theme.muted}`}>
                Explore the tools available in FinAI.
              </p>

              <div className="mt-6 space-y-5 sm:mt-7">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-cyan-500"
                      size={19}
                    />
                    <p className={`text-sm leading-6 ${theme.muted}`}>
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 sm:mt-8 sm:p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    className="shrink-0 text-cyan-500"
                    size={23}
                  />
                  <p className="font-semibold">
                    Your account, your workspace
                  </p>
                </div>

                <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>
                  Sign in to access your personalized portfolio and
                  financial tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-blue-600/10 px-5 py-12 text-center text-white sm:rounded-3xl sm:px-12 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-sm">
              Start exploring
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-bold leading-tight sm:text-3xl lg:text-5xl">
              Bring more clarity to your financial decisions.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:mt-5 sm:text-base">
              Create your account and explore the tools available in FinAI.
            </p>

            <Link
              to="/signup"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 sm:mt-8 sm:px-7 sm:py-4 sm:text-base"
            >
              Get started
              <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${theme.border} ${theme.footer}`}>
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-8 sm:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
            {/* Brand */}
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight">
                Fin<span className="text-blue-500">AI</span>
              </h2>

              <p className={`mt-4 text-sm leading-6 ${theme.muted}`}>
                AI-powered financial insights and portfolio analysis.
                Make smarter investment decisions with confidence.
              </p>
            </div>

            {/* Products */}
            <div>
              <h3 className="mb-4 font-semibold">Products</h3>

              <ul className={`space-y-3 text-sm ${theme.muted}`}>
                <li>
                  <Link to="/dashboard" className="transition hover:text-cyan-500">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/analysis" className="transition hover:text-cyan-500">
                    Market Analysis
                  </Link>
                </li>
                <li>
                  <Link to="/strategies" className="transition hover:text-cyan-500">
                    Trading Strategies
                  </Link>
                </li>
                <li>
                  <Link to="/backtesting" className="transition hover:text-cyan-500">
                    Backtesting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help & Info */}
            <div>
              <h3 className="mb-4 font-semibold">Help & Info</h3>

              <ul className={`space-y-3 text-sm ${theme.muted}`}>
                <li>
                  <Link to="/learning" className="transition hover:text-cyan-500">
                    Learning Center
                  </Link>
                </li>
                <li>
                  <Link to="/portfolio" className="transition hover:text-cyan-500">
                    Portfolio Guide
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist" className="transition hover:text-cyan-500">
                    Watchlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="mb-4 font-semibold">Features</h3>

              <ul className={`space-y-3 text-sm ${theme.muted}`}>
                <li>AI-powered Market Insights</li>
                <li>Technical Indicators</li>
                <li>Portfolio Tracking</li>
                <li>Strategy Backtesting</li>
              </ul>
            </div>
          </div>

          <div
            className={`mt-9 flex flex-col justify-between gap-4 border-t pt-6 text-sm sm:mt-10 sm:flex-row sm:items-center ${theme.border} ${theme.muted}`}
          >
            <p>
              © {new Date().getFullYear()} FinAI. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <a href="#" className="transition hover:text-cyan-500">
                Privacy Policy
              </a>
              <a href="#" className="transition hover:text-cyan-500">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
