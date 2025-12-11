import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzePassword = async () => {
    if (!password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) throw new Error("Unable to reach analyzer");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const levelColors = {
    "Very Weak": "bg-red-500/20 text-red-300 border border-red-500/30",
    Weak: "bg-orange-500/20 text-orange-200 border border-orange-500/30",
    Moderate: "bg-amber-400/20 text-amber-100 border border-amber-400/30",
    Strong: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
    "Very Strong": "bg-sky-500/20 text-sky-100 border border-sky-500/30",
  };

  const scorePercent = result ? Math.min((result.password_strength.score / 5) * 100, 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-10">
        <header className="relative overflow-hidden rounded-3xl p-[1px] gradient-border">
          <div className="glass-panel rounded-3xl p-10 grid lg:grid-cols-[1.1fr,1fr] gap-8 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200 floating-badge rounded-full">
                Live check
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mt-4 text-white leading-tight">
                SafeKey Inspector
              </h1>
              <p className="text-slate-200/80 mt-4 text-lg">
                Test password strength, see entropy, and check breaches in seconds. Your input
                never leaves your session—only anonymized hashes are sent to the breach service.
              </p>
              <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
                <div className="glass-panel rounded-2xl p-4 text-left">
                  <p className="text-slate-300">Entropy score</p>
                  <p className="text-2xl font-semibold text-white">
                    {result ? `${result.password_strength.entropy} bits` : "—"}
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-4 text-left">
                  <p className="text-slate-300">Strength level</p>
                  <p className="text-2xl font-semibold text-white">
                    {result ? result.password_strength.level : "Awaiting input"}
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-4 text-left">
                  <p className="text-slate-300">Breach status</p>
                  <p className="text-2xl font-semibold text-white">
                    {result
                      ? result.breach_data.breached
                        ? "Found"
                        : "Clear"
                      : "Not checked"}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-200">Password to inspect</label>
                <span className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                  Local & ephemeral
                </span>
              </div>
              <input
                type="password"
                className="w-full mt-1 p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition"
                placeholder="Enter a password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={analyzePassword}
                className="mt-4 w-full py-3 rounded-xl font-semibold text-slate-900 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:shadow-lg hover:shadow-emerald-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading || !password}
              >
                {loading ? "Analyzing..." : "Run analysis"}
              </button>
              {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
              <p className="text-xs text-slate-400 mt-3">
                Tip: avoid real passwords. Try varied lengths, symbols, and phrases to see how the
                checker responds.
              </p>
            </div>
          </div>
        </header>

        {result && (
          <div className="grid lg:grid-cols-[1fr,0.9fr] gap-6 items-start">
            <section className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Strength breakdown</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[result.password_strength.level]}`}
                >
                  {result.password_strength.level}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Overall score</span>
                  <span>{result.password_strength.score}/5</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 transition-all"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(result.password_strength.checks).map(([check, passed]) => (
                  <div
                    key={check}
                    className={`rounded-2xl p-4 border ${
                      passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <p className="text-sm font-semibold capitalize text-white flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          passed ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      {check.replace("_", " ")}
                    </p>
                    <p className="text-xs text-slate-200/80 mt-1">
                      {passed ? "Looks good" : "Needs attention"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Breach check</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-200">
                  Powered by k-anonymity
                </span>
              </div>
              {result.breach_data.breached ? (
                <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10">
                  <p className="text-red-200 font-semibold text-lg">⚠ Found in breaches</p>
                  <p className="text-slate-100 text-sm mt-1">
                    This password appears in public breach corpora at least{" "}
                    <span className="font-semibold">{result.breach_data.count}</span> times. Please
                    rotate it everywhere it is used.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                  <p className="text-emerald-200 font-semibold text-lg">✔ Not found</p>
                  <p className="text-slate-100 text-sm mt-1">
                    The password was not detected in the known breach dataset used for this check.
                  </p>
                </div>
              )}
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white mb-1">How the breach check works</p>
                <p className="text-slate-300/90">
                  We hash your input with SHA-1, send only the first 5 characters to the Have I Been
                  Pwned range API, and match locally—your full password never leaves your device.
                </p>
              </div>
            </section>
          </div>
        )}

        <footer className="text-sm text-slate-400 glass-panel rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Privacy-first: nothing is stored or logged.
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-slate-300">
            <span>
              Breach data powered by{" "}
              <a
                href="https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange"
                className="text-emerald-300 hover:text-emerald-200 underline"
                target="_blank"
                rel="noreferrer"
              >
                Have I Been Pwned range API
              </a>
              .
            </span>
            <span className="text-slate-400">Made by Rohan.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
