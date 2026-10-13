import { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  GraduationCap,
  Play,
  RotateCcw,
  TrendingUp,
  X,
} from 'lucide-react';

import Navbar from '../../pages/Navbar/Navbar';

const lessons = [
  {
    id: 1,
    title: 'Introduction to Financial Markets',
    description: 'Understand stocks, exchanges, and how markets work.',
    duration: '5 min',
    content: [
      {
        heading: 'What is the stock market?',
        text: 'The stock market is where investors buy and sell shares of publicly listed companies.',
      },
      {
        heading: 'What is a stock?',
        text: 'A stock represents partial ownership in a company. Its price can change with demand, company performance, and market conditions.',
      },
      {
        heading: 'Why do stock prices change?',
        text: 'Prices respond to earnings, economic news, investor expectations, interest rates, and supply and demand.',
      },
    ],
  },
  {
    id: 2,
    title: 'Understanding Stock Prices',
    description: 'Learn about price movements, returns, and volatility.',
    duration: '6 min',
    content: [
      {
        heading: 'Stock price',
        text: 'A stock price is the current market price at which a share trades.',
      },
      {
        heading: 'Returns',
        text: 'Returns measure the gain or loss on an investment over a period. They can include price changes and dividends.',
      },
      {
        heading: 'Volatility',
        text: 'Volatility describes how much a stock price fluctuates. Higher volatility generally means larger price movements.',
      },
    ],
  },
  {
    id: 3,
    title: 'Fundamental Analysis',
    description: 'Evaluate a company using its financial information.',
    duration: '7 min',
    content: [
      {
        heading: 'What is fundamental analysis?',
        text: 'Fundamental analysis evaluates a company using its business model, financial statements, growth, and competitive position.',
      },
      {
        heading: 'Revenue and profit',
        text: 'Revenue is the money a company earns from its operations. Profit is what remains after expenses.',
      },
      {
        heading: 'P/E ratio',
        text: 'The price-to-earnings ratio compares a company’s share price with its earnings per share. Compare it with similar companies and growth expectations.',
      },
    ],
  },
  {
    id: 4,
    title: 'Technical Analysis Basics',
    description: 'Understand charts, trends, support, and resistance.',
    duration: '7 min',
    content: [
      {
        heading: 'Price charts',
        text: 'Price charts show how an asset’s price changes over time. Candlestick charts display opening, closing, high, and low prices.',
      },
      {
        heading: 'Support and resistance',
        text: 'Support is a price area where buying interest may emerge. Resistance is an area where selling pressure may appear.',
      },
      {
        heading: 'Trend',
        text: 'An uptrend generally forms higher highs and higher lows. A downtrend generally forms lower highs and lower lows.',
      },
    ],
  },
  {
    id: 5,
    title: 'Moving Averages and EMA',
    description: 'Learn how moving averages help identify trends.',
    duration: '6 min',
    content: [
      {
        heading: 'Simple Moving Average (SMA)',
        text: 'An SMA calculates the average closing price over a selected number of periods.',
      },
      {
        heading: 'Exponential Moving Average (EMA)',
        text: 'An EMA gives greater weight to recent prices, so it reacts faster to recent changes than an SMA.',
      },
      {
        heading: 'Using moving averages',
        text: 'Moving averages can help identify trends, but they lag behind price and should not be treated as guaranteed trading signals.',
      },
    ],
  },
  {
    id: 6,
    title: 'RSI and MACD Indicators',
    description: 'Understand two commonly used technical indicators.',
    duration: '8 min',
    content: [
      {
        heading: 'Relative Strength Index (RSI)',
        text: 'RSI ranges from 0 to 100 and measures recent price momentum. Readings above 70 or below 30 are commonly studied as potential overbought or oversold conditions, not automatic trading signals.',
      },
      {
        heading: 'Moving Average Convergence Divergence (MACD)',
        text: 'MACD compares two exponential moving averages. Its MACD line, signal line, and histogram help analyse momentum and possible trend changes.',
      },
      {
        heading: 'Combine indicators carefully',
        text: 'Indicators can disagree and produce false signals. Consider price trends, market context, and risk before making a decision.',
      },
    ],
  },
  {
    id: 7,
    title: 'Portfolio Management',
    description: 'Learn about diversification and investment risk.',
    duration: '6 min',
    content: [
      {
        heading: 'Diversification',
        text: 'Diversification spreads investments across different assets or sectors to reduce dependence on a single investment.',
      },
      {
        heading: 'Risk tolerance',
        text: 'Risk tolerance is how much investment uncertainty or potential loss you can comfortably accept.',
      },
      {
        heading: 'Portfolio allocation',
        text: 'Asset allocation determines how your money is distributed among investments. It should reflect your goals, time horizon, and risk tolerance.',
      },
    ],
  },
  {
    id: 8,
    title: 'Backtesting Trading Strategies',
    description: 'Discover how historical data can test a strategy.',
    duration: '8 min',
    content: [
      {
        heading: 'What is backtesting?',
        text: 'Backtesting applies a trading strategy to historical market data to evaluate how it would have performed.',
      },
      {
        heading: 'Important metrics',
        text: 'Common metrics include total return, win rate, maximum drawdown, and risk-adjusted performance.',
      },
      {
        heading: 'Understand the limitations',
        text: 'Historical performance does not guarantee future results. Fees, slippage, data quality, and overfitting can make real-world results different.',
      },
    ],
  },
];

const getUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
      user.id ||
      user.userId ||
      user.email ||
      user.username ||
      'guest'
    );
  } catch {
    return 'guest';
  }
};

const getProgressKey = () =>
  `finai_tutorial_progress_${getUserKey()}`;

const readProgress = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(getProgressKey()) || '[]'
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(
      (id) =>
        Number.isInteger(id) &&
        lessons.some((lesson) => lesson.id === id)
    );
  } catch {
    return [];
  }
};

export default function FinanceTutorial({
  autoOpen = false,
  onClose,
}) {
  const [open, setOpen] = useState(autoOpen);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showLesson, setShowLesson] = useState(false);

  useEffect(() => {
    setCompleted(readProgress());
  }, []);

  useEffect(() => {
    setOpen(autoOpen);
  }, [autoOpen]);

  const completedCount = completed.length;
  const progress = Math.round(
    (completedCount / lessons.length) * 100
  );

  const currentLesson = lessons[activeLesson];
  const isCompleted = completed.includes(currentLesson.id);

  const saveProgress = (updatedCompleted) => {
    setCompleted(updatedCompleted);

    try {
      localStorage.setItem(
        getProgressKey(),
        JSON.stringify(updatedCompleted)
      );
    } catch {
      // Progress remains available for this session.
    }
  };

  const closeTutorial = () => {
    setOpen(false);
    setShowLesson(false);
    onClose?.();
  };

  const startLesson = (index) => {
    setActiveLesson(index);
    setShowLesson(true);
    setOpen(true);
  };

  const finishLesson = () => {
    const updatedCompleted = completed.includes(currentLesson.id)
      ? completed
      : [...completed, currentLesson.id];

    saveProgress(updatedCompleted);

    const nextIncompleteIndex = lessons.findIndex(
      (lesson, index) =>
        index > activeLesson &&
        !updatedCompleted.includes(lesson.id)
    );

    if (nextIncompleteIndex !== -1) {
      setActiveLesson(nextIncompleteIndex);
      return;
    }

    const firstIncompleteIndex = lessons.findIndex(
      (lesson) => !updatedCompleted.includes(lesson.id)
    );

    if (firstIncompleteIndex !== -1) {
      setActiveLesson(firstIncompleteIndex);
    } else {
      setShowLesson(false);
    }
  };

  const resetProgress = () => {
    saveProgress([]);
    setActiveLesson(0);
    setShowLesson(false);
  };

  if (!open) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-950 dark:text-white sm:p-6">
        {/* Page header with profile and theme controls */}
        <header className="-mx-4 -mt-4 mb-6 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:-mx-6 sm:-mt-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Finance Tutorial
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Learn investing, technical analysis, and portfolio management.
              </p>
            </div>

            <Navbar />
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <GraduationCap size={26} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Finance Learning Center
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Learn investing concepts at your own pace.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen size={15} />
                    {lessons.length} lessons
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={15} />
                    About 53 minutes
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {completedCount > 0 ? (
                <>
                  <Play size={16} />
                  Continue Learning
                </>
              ) : (
                <>
                  <BookOpen size={16} />
                  Start Learning
                </>
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Your progress
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {completedCount}/{lessons.length} completed
              </span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
              role="progressbar"
              aria-label="Tutorial progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-950 dark:text-white sm:p-6">
      {/* Page header with profile and theme controls */}
      <header className="-mx-4 -mt-4 mb-6 border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:-mx-6 sm:-mt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Finance Tutorial
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Learn investing, technical analysis, and portfolio management.
            </p>
          </div>

          <Navbar />
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <TrendingUp size={23} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Finance Learning Center
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Build your financial knowledge step by step.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeTutorial}
            aria-label="Close tutorial"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="border-b border-gray-200 p-4 dark:border-gray-700 md:border-b-0 md:border-r sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Course lessons
              </h3>

              <button
                type="button"
                onClick={resetProgress}
                title="Reset lesson progress"
                aria-label="Reset lesson progress"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Overall progress</span>
                <span>{progress}%</span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                role="progressbar"
                aria-label="Course progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
              {lessons.map((lesson, index) => {
                const done = completed.includes(lesson.id);
                const active = showLesson && activeLesson === index;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => startLesson(index)}
                    className={`flex min-w-48 flex-1 items-start gap-3 rounded-xl border p-3 text-left transition md:min-w-0 ${
                      active
                        ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/50'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      ) : (
                        <span
                          className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[10px] ${
                            active
                              ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                              : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {lesson.id}
                        </span>
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        {lesson.title}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        {lesson.duration}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 p-5 sm:p-6">
            {showLesson ? (
              <>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Lesson {activeLesson + 1} of {lessons.length}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={15} />
                    {currentLesson.duration}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {currentLesson.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {currentLesson.description}
                </p>

                <div className="mt-6 space-y-4">
                  {currentLesson.content.map((item, index) => (
                    <section
                      key={`${currentLesson.id}-${index}`}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.heading}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {item.text}
                      </p>
                    </section>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveLesson((index) => Math.max(0, index - 1))
                    }
                    disabled={activeLesson === 0}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      <CircleCheck size={17} />
                      Completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={finishLesson}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      <CheckCircle2 size={16} />
                      Complete lesson
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (activeLesson < lessons.length - 1) {
                        setActiveLesson((index) => index + 1);
                      } else {
                        setShowLesson(false);
                      }
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <div className="rounded-full bg-emerald-100 p-4 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <GraduationCap size={30} />
                </div>

                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  {completedCount === lessons.length
                    ? 'Course completed!'
                    : 'Ready to learn?'}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {completedCount === lessons.length
                    ? 'You have completed all lessons. You can revisit any lesson whenever you want.'
                    : `${completedCount} of ${lessons.length} lessons completed. Select a lesson from the list to continue.`}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const firstIncompleteIndex = lessons.findIndex(
                      (lesson) => !completed.includes(lesson.id)
                    );

                    startLesson(
                      firstIncompleteIndex === -1
                        ? 0
                        : firstIncompleteIndex
                    );
                  }}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  <Play size={16} />
                  {completedCount === lessons.length
                    ? 'Review lessons'
                    : 'Continue learning'}
                </button>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
