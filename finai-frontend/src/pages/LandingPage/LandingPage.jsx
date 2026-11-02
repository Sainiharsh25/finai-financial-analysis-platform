
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
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

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

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen overflow-hidden bg-[#080d19] text-white">
      {/* Navigation */}
      <header className="relative z-50 border-b border-white/10 bg-[#080d19]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="rounded-xl bg-cyan-400 p-2.5 text-slate-950">
              <TrendingUp size={23} />
            </div>
            <span className="text-2xl font-bold tracking-tight">FinAI</span>
          </Link>

          <div className="hidden items-center gap-9 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-cyan-300">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-cyan-300">
              How it works
            </a>
            <a href="#about" className="transition hover:text-cyan-300">
              About
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Get started <ArrowUpRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-white/10 p-2 text-slate-200 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0b1220] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-5 text-sm text-slate-300">
              <a href="#features" onClick={closeMenu}>Features</a>
              <a href="#how-it-works" onClick={closeMenu}>How it works</a>
              <a href="#about" onClick={closeMenu}>About</a>
              <Link to="/login" onClick={closeMenu}>Log in</Link>
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

      {/* Hero */}
      <main>
        <section className="relative">
          <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:py-32">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                YOUR FINANCIAL INTELLIGENCE PLATFORM
              </div>

              <h1 className="max-w-2xl text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
                Take control of your{' '}
                <span className="text-cyan-400">financial future.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Track your portfolio, analyze market trends and explore
                intelligent trading strategies — all in one place with FinAI.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Get started <ArrowRight size={19} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-4 font-semibold text-white transition hover:border-cyan-400/50 hover:bg-white/5"
                >
                  Sign in to FinAI
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Portfolio tracking
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  Technical analysis
                </span>
              </div>
            </div>

            {/* Dashboard preview - illustrative design */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[2rem] bg-cyan-400/10 blur-3xl" />

              <div className="relative rounded-3xl border border-white/10 bg-[#101a2b] p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Portfolio overview</p>
                    <h2 className="mt-2 text-2xl font-bold">Your investments</h2>
                  </div>
                  <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                    <ChartNoAxesCombined size={23} />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-[#0b1423] p-5">
                  <p className="text-sm text-slate-400">Portfolio value</p>
                  <p className="mt-2 text-3xl font-bold">₹12,45,800</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-400">
                    <TrendingUp size={16} />
                    +8.42% <span className="font-normal text-slate-500">overall return</span>
                  </p>

                  <div className="mt-7 flex h-36 items-end gap-2">
                    {[35, 48, 40, 58, 52, 68, 57, 78, 66, 90, 74, 100].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-700 to-cyan-300 opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      ),
                    )}
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>May</span>
                    <span>Jul</span>
                    <span>Sep</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1423] p-4">
                    <p className="text-xs text-slate-400">Invested value</p>
                    <p className="mt-2 text-lg font-bold">₹11,49,000</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b1423] p-4">
                    <p className="text-xs text-slate-400">Total P&amp;L</p>
                    <p className="mt-2 text-lg font-bold text-emerald-400">
                      +₹96,800
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-center text-[10px] text-slate-500">
                  Illustrative dashboard preview · Not live market data
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-white/10 bg-[#0b1220] py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                Powerful features
              </p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Everything you need to understand your investments.
              </h2>
              <p className="mt-5 leading-7 text-slate-400">
                A unified workspace for tracking, analyzing and understanding
                your financial activity.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-white/10 bg-[#101a2b] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
                >
                  <div className="inline-flex rounded-xl bg-cyan-400/10 p-3 text-cyan-300 transition group-hover:bg-cyan-400 group-hover:text-slate-950">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                One platform. Better visibility.
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Make your financial activity easier to understand.
              </h2>
              <p className="mt-5 leading-8 text-slate-400">
                FinAI brings portfolio information, stock analysis and
                strategy signals together so you can explore your investments
                with greater clarity.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Explore FinAI <ArrowRight size={18} />
              </Link>
            </div>

            <div id="about" className="rounded-3xl border border-white/10 bg-[#101a2b] p-7 sm:p-9">
              <h3 className="text-xl font-bold">Your financial workspace</h3>
              <p className="mt-2 text-sm text-slate-400">
                Explore the tools available in FinAI.
              </p>

              <div className="mt-7 space-y-5">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-400" size={19} />
                    <p className="text-sm leading-6 text-slate-300">{benefit}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-cyan-300" size={23} />
                  <p className="font-semibold">Your account, your workspace</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sign in to access your personalized portfolio and financial tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-24 sm:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-[#101a2b] to-blue-600/10 px-6 py-16 text-center sm:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Start exploring
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold sm:text-5xl">
              Bring more clarity to your financial decisions.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
              Create your account and explore the tools available in FinAI.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Get started <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#060a12]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-400 p-2 text-slate-950">
              <TrendingUp size={18} />
            </div>
            <span className="text-lg font-bold">FinAI</span>
          </Link>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} FinAI. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/login" className="transition hover:text-cyan-300">
              Login
            </Link>
            <Link to="/signup" className="transition hover:text-cyan-300">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
