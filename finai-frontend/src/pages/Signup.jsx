
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  TrendingUp,
  Mail,
  Lock,
  User,
} from "lucide-react";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const getErrorMessage = (err) => {
    const data = err.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      if (data.message) return data.message;
      if (data.detail) return data.detail;
      if (data.error) return data.error;

      if (data.errors && typeof data.errors === "object") {
        return Object.values(data.errors).join(" ");
      }
    }

    if (err.response?.status === 409) {
      return "This email or username may already be registered.";
    }

    if (err.response?.status === 400) {
      return "Registration details are invalid. Please check your entries.";
    }

    if (err.response?.status === 404) {
      return "Registration endpoint not found. Please check the backend API.";
    }

    if (err.response?.status === 500) {
      return "Server error while creating your account. Check the backend console.";
    }

    if (!err.response) {
      return "Cannot connect to the backend. Make sure Spring Boot is running.";
    }

    return `Registration failed (HTTP ${err.response.status}). Please try again.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim();
    const email = form.email.trim();

    if (username.length < 2) {
      setError("Username must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        username,
        email,
        password: form.password,
      });

      // Registration succeeded: show the confirmation on Login.
      navigate("/login", {
        replace: true,
        state: {
          message:
            typeof response.data === "string" &&
            response.data.trim()
              ? `${response.data} You can now log in.`
              : "Account created successfully! You can now log in.",
        },
      });
    } catch (err) {
      console.error(
        "Signup error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-900/70 py-3 pl-11 pr-11 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080d19] p-5 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl md:grid-cols-2">
        {/* Branding panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-cyan-500/20 via-slate-900 to-blue-600/20 p-10 md:flex">
          <Link to="/signup" className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400 p-2.5 text-slate-950">
              <TrendingUp size={25} />
            </div>
            <span className="text-2xl font-bold">FinAI</span>
          </Link>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Smarter financial decisions
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Your financial journey starts here.
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

        {/* Signup form */}
        <div className="p-6 sm:p-10 md:p-12">
          <Link
            to="/signup"
            className="mb-8 inline-flex items-center gap-3 md:hidden"
          >
            <TrendingUp className="text-cyan-400" size={25} />
            <span className="text-xl font-bold">FinAI</span>
          </Link>

          <p className="text-sm font-semibold text-cyan-400">
            GET STARTED
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Create your account
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign up to start exploring your financial dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm text-slate-300">
                Username
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  minLength={2}
                  maxLength={50}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm text-slate-300">
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
