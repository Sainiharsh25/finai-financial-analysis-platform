import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  TrendingUp,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInEmail = email.trim();

      const response = await api.post("/api/auth/login", {
        email: loggedInEmail,
        password,
      });

      // Save the JWT token
      localStorage.setItem("token", response.data.token);

      // Save user details for the Navbar
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: loggedInEmail.split("@")[0],
          email: loggedInEmail,
        })
      );

      // Redirect after successful login
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : "Invalid email or password. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/70 py-3 pl-11 pr-12 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d19] p-5 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl md:grid-cols-2">

        {/* Left branding panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-cyan-500/20 via-slate-900 to-blue-600/20 p-10 md:flex">
          <Link to="/login" className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400 p-2.5 text-slate-950">
              <TrendingUp size={25} />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              FinAI
            </span>
          </Link>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Smarter financial decisions
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Welcome back to your financial journey.
            </h1>

            <p className="mt-5 leading-7 text-slate-400">
              Track your portfolio, analyze market trends, explore
              trading strategies, and make data-informed decisions
              in one place.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            AI-powered insights. Clearer financial decisions.
          </p>
        </div>

        {/* Login form */}
        <div className="p-6 sm:p-10 md:p-12">
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-3 md:hidden"
          >
            <div className="rounded-xl bg-cyan-400 p-2 text-slate-950">
              <TrendingUp size={22} />
            </div>

            <span className="text-xl font-bold">FinAI</span>
          </Link>

          <p className="text-sm font-semibold text-cyan-400">
            WELCOME BACK
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Sign in to FinAI
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Continue to your financial intelligence dashboard.
          </p>

          {successMessage && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
            >
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-slate-300"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;