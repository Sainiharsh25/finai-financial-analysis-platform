
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const lessons = [
  {
    id: 1,
    title: 'Introduction to Finance',
    category: 'Start here',
    duration: '5 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=1000&q=80',
    description:
      'Understand money, income, expenses, saving and investing.',
    sections: [
      {
        heading: 'What is finance?',
        body:
          'Finance is how people and businesses earn, manage, save, borrow and invest money. Personal finance focuses on your own financial goals and decisions.',
      },
      {
        heading: 'Saving versus investing',
        body:
          'Saving usually means keeping money accessible for near-term needs. Investing means putting money into assets that may grow in value, while accepting the possibility of losses.',
      },
      {
        heading: 'Build a strong foundation',
        body:
          'Start by understanding your income, tracking expenses, setting aside emergency savings and learning about risk before investing.',
      },
    ],
    takeaway: 'Know your goals before deciding where your money goes.',
    links: [
      {
        label: 'Khan Academy: Financial literacy',
        url: 'https://www.khanacademy.org/college-careers-more/personal-finance',
      },
    ],
    question: 'What is one key difference between saving and investing?',
    options: [
      'Investing always guarantees a profit',
      'Investing involves risk and potential returns',
      'Saving always gives higher returns',
    ],
    answer: 1,
    explanation:
      'Investments can rise or fall in value. Savings are generally intended to preserve money and keep it accessible.',
  },
  {
    id: 2,
    title: 'Basics of Investing',
    category: 'Foundations',
    duration: '7 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    description:
      'Learn about stocks, bonds, mutual funds and compounding.',
    sections: [
      {
        heading: 'What is a stock?',
        body:
          'A stock represents ownership in a company. Its market price can change as expectations, company performance and market conditions change.',
      },
      {
        heading: 'Different investments',
        body:
          'Stocks, bonds, mutual funds, exchange-traded funds and bank deposits have different risks, costs, liquidity and potential returns.',
      },
      {
        heading: 'Compounding',
        body:
          'Compounding occurs when returns generate additional returns over time. Actual investment growth is not guaranteed and can be negative.',
      },
    ],
    takeaway:
      'Understand the investment, its costs and its risks before investing.',
    links: [
      {
        label: 'SEBI Investor Education',
        url: 'https://investor.sebi.gov.in/',
      },
      {
        label: 'Zerodha Varsity: Markets and investing',
        url: 'https://zerodha.com/varsity/',
      },
    ],
    question: 'What does owning a company stock generally mean?',
    options: [
      'You own a small part of the company',
      'The company guarantees you interest',
      'You cannot lose money',
    ],
    answer: 0,
    explanation:
      'Shares represent ownership. Their prices can fall, and dividends are not guaranteed.',
  },
  {
    id: 3,
    title: 'Stock Market 101',
    category: 'Markets',
    duration: '8 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80',
    description:
      'Understand exchanges, orders, price movements and market indices.',
    sections: [
      {
        heading: 'How a market works',
        body:
          'A stock exchange provides a regulated marketplace where eligible participants can buy and sell securities under its rules.',
      },
      {
        heading: 'Buy and sell orders',
        body:
          'A market order prioritizes execution at available prices. A limit order specifies the maximum buying price or minimum selling price you will accept, but may not execute.',
      },
      {
        heading: 'Indices',
        body:
          'An index tracks a selected group of securities according to its methodology. The Nifty 50 and BSE Sensex are widely followed Indian equity indices.',
      },
    ],
    takeaway:
      'A stock price can move quickly; understand your order before placing it.',
    links: [
      {
        label: 'NSE India',
        url: 'https://www.nseindia.com/',
      },
      {
        label: 'BSE India',
        url: 'https://www.bseindia.com/',
      },
    ],
    question: 'What does a limit order do?',
    options: [
      'Guarantees a profit',
      'Sets a price limit for the order',
      'Removes market risk',
    ],
    answer: 1,
    explanation:
      'A limit order controls the price you are willing to accept, but it may not be filled.',
  },
  {
    id: 4,
    title: 'Risk Management',
    category: 'Protect your money',
    duration: '7 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    description:
      'Learn about volatility, diversification and responsible risk limits.',
    sections: [
      {
        heading: 'Risk and return',
        body:
          'Higher potential returns often come with higher risks. No strategy eliminates the possibility of losing money.',
      },
      {
        heading: 'Diversification',
        body:
          'Holding different investments can reduce dependence on a single company or sector. Diversification cannot eliminate all market risk.',
      },
      {
        heading: 'Position sizing',
        body:
          'Decide how much exposure you can afford before entering an investment. Avoid borrowing or using essential expenses to speculate.',
      },
    ],
    takeaway:
      'Protecting your ability to meet financial needs comes before chasing returns.',
    links: [
      {
        label: 'SEBI Investor Education',
        url: 'https://investor.sebi.gov.in/',
      },
    ],
    question: 'What can diversification help reduce?',
    options: [
      'Every type of investment risk',
      'Dependence on a single investment',
      'All possibility of losses',
    ],
    answer: 1,
    explanation:
      'Diversification spreads exposure, but broad market declines can still affect many investments at once.',
  },
  {
    id: 5,
    title: 'Trading Strategies',
    category: 'Technical analysis',
    duration: '10 min',
    level: 'Intermediate',
    image:
       'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80',
    description:
      'Explore RSI, MACD, moving averages and Bollinger Bands in FinAI.',
    sections: [
      {
        heading: 'RSI',
        body:
          'The Relative Strength Index measures the speed and magnitude of recent price changes. Readings above 70 or below 30 are commonly used reference levels, not automatic sell or buy instructions.',
      },
      {
        heading: 'MACD',
        body:
          'Moving Average Convergence Divergence compares exponential moving averages. Traders examine the MACD line, signal line and histogram to study momentum.',
      },
      {
        heading: 'EMA and Bollinger Bands',
        body:
          'Exponential moving averages give greater weight to recent prices. Bollinger Bands use a moving average and standard-deviation-based bands to help examine volatility.',
      },
      {
        heading: 'Test before using',
        body:
          'A strategy signal is not a guarantee. Evaluate historical performance, transaction costs, drawdowns and out-of-sample results before relying on a strategy.',
      },
    ],
    takeaway:
      'Indicators describe price behaviour; they cannot predict the future with certainty.',
    links: [
      {
        label: 'Zerodha Varsity: Technical analysis',
        url: 'https://zerodha.com/varsity/',
      },
    ],
    question: 'What does an RSI reading tell you?',
    options: [
      'The company’s guaranteed future profit',
      'A measure of recent price momentum',
      'The exact future stock price',
    ],
    answer: 1,
    explanation:
      'RSI is a momentum indicator based on recent price changes. It does not guarantee a reversal.',
  },
  {
    id: 6,
    title: 'Portfolio Diversification',
    category: 'Portfolio building',
    duration: '6 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
    description:
      'Learn why concentration, asset allocation and rebalancing matter.',
    sections: [
      {
        heading: 'Avoid excessive concentration',
        body:
          'Putting most of your money into one stock or industry makes your outcome more dependent on that investment.',
      },
      {
        heading: 'Asset allocation',
        body:
          'Asset allocation is the mix of investment types you hold. Your goals, time horizon, ability to tolerate losses and financial circumstances all matter.',
      },
      {
        heading: 'Rebalancing',
        body:
          'Rebalancing means adjusting a portfolio toward a chosen allocation. Consider transaction costs, taxes and whether your goals have changed.',
      },
    ],
    takeaway:
      'Build a portfolio around your goals and risk tolerance, not market excitement.',
    links: [
      {
        label: 'SEBI Investor Education',
        url: 'https://investor.sebi.gov.in/',
      },
      {
        label: 'AMFI India',
        url: 'https://www.amfiindia.com/',
      },
    ],
    question: 'Why might an investor diversify?',
    options: [
      'To guarantee returns',
      'To reduce dependence on one investment',
      'To avoid reviewing investments',
    ],
    answer: 1,
    explanation:
      'Diversification can reduce concentration risk, but it cannot guarantee a positive return.',
  },
  {
    id: 7,
    title: 'Financial Planning',
    category: 'Your goals',
    duration: '8 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1000&q=80',
    description:
      'Create a budget and set realistic short- and long-term financial goals.',
    sections: [
      {
        heading: 'Make a simple budget',
        body:
          'List your income, fixed expenses, variable expenses, debt payments and savings. Review your actual spending rather than relying on estimates alone.',
      },
      {
        heading: 'Set specific goals',
        body:
          'Define what you are saving for, the approximate amount required and when you may need the money. Near-term goals generally need different risk choices from long-term goals.',
      },
      {
        heading: 'Emergency savings',
        body:
          'Build an accessible reserve for unexpected expenses according to your circumstances. Avoid investing money you may need immediately in volatile assets.',
      },
    ],
    takeaway:
      'A financial plan connects everyday money decisions to your future goals.',
    links: [
      {
        label: 'RBI Financial Education',
        url: 'https://www.rbi.org.in/FinancialEducation/',
      },
      {
        label: 'Khan Academy: Personal finance',
        url: 'https://www.khanacademy.org/college-careers-more/personal-finance',
      },
    ],
    question: 'What is a useful first step in budgeting?',
    options: [
      'Track income and expenses',
      'Invest all available cash',
      'Ignore irregular expenses',
    ],
    answer: 0,
    explanation:
      'Knowing where money comes from and where it goes helps you plan realistic savings and spending.',
  },
  {
    id: 8,
    title: 'Your Next Steps with FinAI',
    category: 'Practice',
    duration: '4 min',
    level: 'Beginner',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    description:
      'Connect what you learned to your FinAI dashboard and analysis tools.',
    sections: [
      {
        heading: 'Start with a stock',
        body:
          'Open Stock Analysis in FinAI and search for a company you know. Review the available price information and indicators before drawing conclusions.',
      },
      {
        heading: 'Understand the signal',
        body:
          'Compare a strategy result with its underlying indicator and historical price behaviour. A BUY, SELL or HOLD label is a model output, not a personal recommendation.',
      },
      {
        heading: 'Keep learning',
        body:
          'Use watchlists to follow companies, study portfolio risk and practise interpreting historical results. Do not assume past performance will repeat.',
      },
    ],
    takeaway:
      'Use FinAI to learn and analyse; make decisions only after independent research.',
    links: [
      {
        label: 'Open NSE India',
        url: 'https://www.nseindia.com/',
      },
      {
        label: 'Learn with Zerodha Varsity',
        url: 'https://zerodha.com/varsity/',
      },
    ],
    question: 'How should you treat a FinAI strategy signal?',
    options: [
      'As a guaranteed prediction',
      'As one input for further research',
      'As a replacement for risk management',
    ],
    answer: 1,
    explanation:
      'Indicators and strategy outputs are educational tools. They can be wrong and should be evaluated alongside risk and independent research.',
  },
]

function getUserKey() {
  try {
    const candidates = [
      localStorage.getItem('user'),
      localStorage.getItem('currentUser'),
    ]

    for (const value of candidates) {
      if (!value) continue

      const user = JSON.parse(value)
      const id =
        user.id ??
        user.userId ??
        user.email ??
        user.username

      if (id) return String(id).toLowerCase()
    }
  } catch {
    // Use a fallback if stored user information is not valid JSON.
  }

  return 'guest'
}

const progressKey = (userKey) =>
  `finai_learning_progress_${userKey}`

function readProgress(userKey) {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(progressKey(userKey)) || '[]',
    )

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function FinanceLearning() {
  const navigate = useNavigate()
  const userKey = useMemo(() => getUserKey(), [])
  const [completed, setCompleted] = useState(() =>
    readProgress(getUserKey()),
  )
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [checkedQuiz, setCheckedQuiz] = useState(false)
  const [showResources, setShowResources] = useState(false)

  const activeLesson = lessons.find(
    (lesson) => lesson.id === activeLessonId,
  )

  const progressPercent = Math.round(
    (completed.length / lessons.length) * 100,
  )

  useEffect(() => {
    try {
      localStorage.setItem(
        progressKey(userKey),
        JSON.stringify(completed),
      )
    } catch {
      // Learning remains usable if browser storage is unavailable.
    }
  }, [completed, userKey])

  const openLesson = (id) => {
    setActiveLessonId(id)
    setCheckedQuiz(false)
    setShowResources(false)
  }

  const completeLesson = () => {
    if (!activeLesson) return

    setCompleted((current) =>
      current.includes(activeLesson.id)
        ? current
        : [...current, activeLesson.id].sort((a, b) => a - b),
    )
  }

  const nextLesson = () => {
    if (!activeLesson) return

    const next = lessons.find(
      (lesson) => lesson.id === activeLesson.id + 1,
    )

    if (next) openLesson(next.id)
    else setActiveLessonId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-7 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>

          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
                <GraduationCap size={15} />
                FinAI Learning Centre
              </span>

              <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                Understand finance, one lesson at a time.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Start with the basics, explore the stock market and learn
                how to interpret FinAI's indicators at your own pace.
                No previous finance experience is needed.
              </p>

              <button
                type="button"
                onClick={() => {
                  const next = lessons.find(
                    (lesson) => !completed.includes(lesson.id),
                  )
                  openLesson(next?.id ?? 1)
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <PlayCircle size={18} />
                {completed.length === lessons.length
                  ? 'Review lessons'
                  : completed.length > 0
                    ? 'Continue learning'
                    : 'Start learning'}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Your learning progress
                </span>
                <BookOpen size={20} className="text-cyan-300" />
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-bold">
                  {completed.length}
                </span>
                <span className="pb-1 text-slate-300">
                  / {lessons.length} lessons
                </span>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
                role="progressbar"
                aria-label="Course progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-300">
                {progressPercent === 100
                  ? 'Course completed! Keep practising.'
                  : `${progressPercent}% completed. You can learn at your own pace.`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-5 py-9 sm:px-8">
        {activeLesson ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-48 sm:h-64">
              <img
                src={activeLesson.image}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white sm:left-8">
                <p className="text-sm text-cyan-200">
                  Lesson {activeLesson.id} · {activeLesson.duration}
                </p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {activeLesson.title}
                </h2>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <button
                type="button"
                onClick={() => setActiveLessonId(null)}
                className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                All lessons
              </button>

              <p className="mb-7 text-sm leading-6 text-slate-600">
                {activeLesson.description}
              </p>

              <div className="space-y-7">
                {activeLesson.sections.map((section, index) => (
                  <article key={section.heading}>
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-sm font-semibold text-cyan-700">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {section.heading}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {section.body}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <Lightbulb
                    size={20}
                    className="shrink-0 text-amber-600"
                  />
                  <div>
                    <h3 className="font-semibold text-amber-950">
                      Remember this
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-amber-900">
                      {activeLesson.takeaway}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick knowledge check
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {activeLesson.question}
                </p>

                <div className="mt-4 space-y-3">
                  {activeLesson.options.map((option, index) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                        checkedQuiz
                          ? index === activeLesson.answer
                            ? 'border-emerald-300 bg-emerald-50'
                            : answers[activeLesson.id] === index
                              ? 'border-red-200 bg-red-50'
                              : 'border-slate-200'
                          : answers[activeLesson.id] === index
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${activeLesson.id}`}
                        checked={answers[activeLesson.id] === index}
                        onChange={() => {
                          setAnswers((current) => ({
                            ...current,
                            [activeLesson.id]: index,
                          }))
                          setCheckedQuiz(false)
                        }}
                        className="mt-0.5 accent-cyan-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {checkedQuiz && (
                  <p
                    role="status"
                    className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                  >
                    {answers[activeLesson.id] === activeLesson.answer
                      ? 'Correct! '
                      : 'Not quite. '}
                    {activeLesson.explanation}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckedQuiz(true)}
                    disabled={answers[activeLesson.id] == null}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Check answer
                  </button>

                  {checkedQuiz &&
                    answers[activeLesson.id] === activeLesson.answer && (
                      <button
                        type="button"
                        onClick={completeLesson}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={17} />
                        Mark lesson complete
                      </button>
                    )}
                </div>
              </div>

              <div className="mt-7 rounded-xl bg-slate-50 p-5">
                <button
                  type="button"
                  onClick={() => setShowResources((value) => !value)}
                  className="flex w-full items-center justify-between gap-3 text-left font-semibold text-slate-900"
                >
                  <span>Further reading and resources</span>
                  <ChevronRight
                    size={18}
                    className={`transition-transform ${
                      showResources ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {showResources && (
                  <div className="mt-4 space-y-3">
                    {activeLesson.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-cyan-800 hover:bg-cyan-50"
                      >
                        <span>{link.label}</span>
                        <ExternalLink size={15} className="shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-7 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const previous = lessons.find(
                      (lesson) => lesson.id === activeLesson.id - 1,
                    )
                    if (previous) openLesson(previous.id)
                  }}
                  disabled={activeLesson.id === 1}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous lesson
                </button>

                <button
                  type="button"
                  onClick={nextLesson}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  {activeLesson.id === lessons.length
                    ? 'Finish course'
                    : 'Next lesson'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section>
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-700">
                    YOUR COURSE
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Learn at your own pace
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Complete a lesson and pass its quick knowledge check
                    to track your progress.
                  </p>
                </div>

                <span className="text-sm text-slate-500">
                  {completed.length} of {lessons.length} completed
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {lessons.map((lesson) => {
                  const isComplete = completed.includes(lesson.id)

                  return (
                    <button
                      type="button"
                      key={lesson.id}
                      onClick={() => openLesson(lesson.id)}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
                    >
                      <div className="relative h-40 overflow-hidden bg-slate-200">
                        <img
                          src={lesson.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700">
                          Lesson {lesson.id}
                        </span>
                        {isComplete && (
                          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1.5 text-white">
                            <CheckCircle2 size={17} />
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-cyan-700">
                            {lesson.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            {lesson.duration}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold text-slate-900">
                          {lesson.title}
                        </h3>

                        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                          {lesson.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                          <span
                            className={`text-xs font-medium ${
                              isComplete
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {isComplete ? 'Completed' : lesson.level}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700">
                            {isComplete ? 'Review' : 'Start lesson'}
                            <ArrowRight size={15} />
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-3 text-cyan-700">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Put your learning into practice
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Explore market data after learning the basics.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/analysis')}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
                >
                  Explore Stock Analysis
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-3 text-emerald-700">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Learn safely
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      This course is educational, not personalised
                      financial advice. Never treat an indicator as a
                      guaranteed prediction.
                    </p>
                  </div>
                </div>

                <a
                  href="https://investor.sebi.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline"
                >
                  Visit SEBI Investor Education
                  <ExternalLink size={15} />
                </a>
              </div>
            </section>

            {completed.length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Reset your course progress? This cannot be undone.',
                      )
                    ) {
                      setCompleted([])
                      setAnswers({})
                    }
                  }}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-red-600"
                >
                  <RotateCcw size={15} />
                  Reset progress
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs leading-5 text-slate-500">
        Learning resources are provided for educational purposes.
        External websites have their own content and terms. Investments
        involve risk, including possible loss of principal.
      </footer>
    </div>
  )
}
