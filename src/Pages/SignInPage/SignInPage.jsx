import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  Eye,
  EyeOff,
  FileCheck2,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { addUser } from "../../Components/utils/userSlice";
import { BaseUrl } from "../../Components/utils/constants";
import logo from "../../assets/image.png";

const REMEMBERED_EMAIL_KEY = "presentme_superadmin_email";

const highlights = [
  {
    icon: Building2,
    title: "Institute verification",
    text: "Review and approve new institute registrations.",
  },
  {
    icon: FileCheck2,
    title: "PYQ & Notes",
    text: "Verify uploaded documents and reward contributors.",
  },
  {
    icon: WalletCards,
    title: "Withdrawals",
    text: "Process payout requests from students and teachers.",
  },
];

const fieldClass =
  "flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 transition focus-within:border-[#0A80F5] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0A80F5]/10";
const inputClass =
  "w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed";

// localStorage can throw (private mode, blocked storage), so never let it break sign-in
const readRememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

const saveRememberedEmail = (email, remember) => {
  try {
    if (remember) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  } catch {
    // storage unavailable — nothing to remember
  }
};

const SignInPage = () => {
  const [initialEmail] = useState(readRememberedEmail);
  const [emailId, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(Boolean(initialEmail));
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        BaseUrl + "/sadmin/login",
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );
      saveRememberedEmail(emailId, remember);
      dispatch(addUser(response.data));
      navigate("/superadmin");
    } catch (err) {
      console.error("Error during sign in:", err);
      setError(
        err.response
          ? err.response.data?.message ||
              "Invalid credentials. Please try again."
          : "Unable to reach the server. Check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapsLock = (e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#f0fbff] to-[#eef8ff] flex items-center justify-center px-4 py-10">
      {/* Soft brand glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#0BCCEB]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#0A80F5]/20 blur-3xl" />

      <div className="relative w-full max-w-md lg:max-w-5xl">
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#0A80F5]/10 ring-1 ring-gray-100 lg:grid-cols-2">
          {/* Brand panel (desktop) */}
          <aside className="relative hidden flex-col justify-between gap-12 overflow-hidden bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] p-10 text-white lg:flex">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <img
                src={logo}
                alt=""
                className="h-11 w-11 rounded-xl shadow-md ring-2 ring-white/40"
              />
              <div>
                <div className="font-semibold">Present-Me</div>
                <div className="text-xs text-white/80">Super Admin Panel</div>
              </div>
            </div>

            <div className="relative">
              <h2 className="text-3xl font-semibold leading-tight">
                Manage the entire Present-Me platform from one place.
              </h2>
              <ul className="mt-8 space-y-5">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-white/80">{item.text}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <a
              href="https://presentme.in"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-fit text-sm text-white/80 transition hover:text-white"
            >
              presentme.in
            </a>
          </aside>

          {/* Sign-in form */}
          <main className="p-6 sm:p-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src={logo} alt="" className="h-11 w-11 rounded-xl shadow-md" />
              <div>
                <div className="font-semibold text-gray-800">Present-Me</div>
                <div className="text-xs text-gray-500">Super Admin Panel</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A80F5]/10 px-3 py-1 text-xs font-medium text-[#0A80F5]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Restricted access
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-800">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to your super admin account to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <fieldset disabled={isLoading} className="min-w-0 space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-600"
                  >
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className={fieldClass}>
                    <Mail className="h-5 w-5 shrink-0 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="username"
                      autoFocus={!initialEmail}
                      value={emailId}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="admin@presentme.in"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className={fieldClass}>
                    <Lock className="h-5 w-5 shrink-0 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      autoFocus={Boolean(initialEmail)}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onKeyDown={handleCapsLock}
                      onKeyUp={handleCapsLock}
                      onBlur={() => setCapsLockOn(false)}
                      placeholder="Enter your password"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="shrink-0 rounded-md p-1 text-gray-400 transition hover:text-[#0A80F5] focus-visible:text-[#0A80F5] focus-visible:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {capsLockOn && (
                    <p className="mt-2 text-xs text-amber-600">Caps Lock is on.</p>
                  )}
                </div>

                <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded accent-[#0A80F5]"
                  />
                  Remember my email
                </label>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] py-3 font-medium text-white shadow-md shadow-[#0A80F5]/25 transition hover:shadow-lg hover:shadow-[#0A80F5]/30 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </fieldset>
            </form>
          </main>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Present-Me. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
