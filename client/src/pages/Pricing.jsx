import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const FREE_FEATURES = [
  "Focus timer (25, 50 min, custom)",
  "Session logging & reflection",
  "Basic stats (today, week, streak)",
  "7-day focus bar chart",
  "Distraction chip tracking",
  "Guest mode — no signup needed",
];

const PRO_FEATURES = [
  "Everything in Free",
  "14-day focus bar chart",
  "Focus rating trend line (30 sessions)",
  "Distraction breakdown donut chart",
  "Full session history + 6 sort options",
  "Week-over-week comparison",
  "Daily email reminders",
  "Export CSV / JSON",
  "Priority support",
  "Early access to new features",
];

const FAQ = [
  { q: "Is there a free trial?", a: "Yes — try Pro free for 3 days, no credit card required." },
  { q: "Can I cancel anytime?", a: "Yes, cancel anytime. Your data remains accessible on the free plan." },
  { q: "Is this a real payment?", a: "No. This is a demo app — no real payment is processed." },
  { q: "Where is my data stored?", a: "Currently in your browser (localStorage). Cloud sync coming with the backend." },
];

export default function Pricing() {
  const { user, upgradePlan } = useAuth();
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const isPro = user?.plan === "pro" || user?.role === "admin";

  function handleGetPro() {
    if (!user) { navigate("/register"); return; }
    upgradePlan("pro");
  }

  function handleTrial() {
    if (!user) { navigate("/register"); return; }
    upgradePlan("pro");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link to="/" className="text-sm flex items-center gap-1 hover:opacity-70 transition-opacity w-fit" style={{ color: "var(--text-muted)" }}>
          Back
        </Link>
      </div>

      <div className="text-center px-6 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: "var(--primary-lt)", color: "var(--primary)" }}>
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: "var(--text)" }}>
          Invest in your focus
        </h1>
        <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          Start free. Upgrade when you want deeper insights into your study patterns.
        </p>

        <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-xl" style={{ background: "var(--primary-muted)", border: "1px solid var(--border)" }}>
          {["monthly", "annually"].map(b => (
            <button
              key={b}
              onClick={() => setAnnual(b === "annually")}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={(b === "annually") === annual ? { background: "var(--primary)", color: "#fff" } : { color: "var(--text-muted)" }}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === "annually" && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#22c55e20", color: "#16a34a" }}>
                  -33%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-4">

          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold" style={{ color: "var(--text)" }}>$0</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/forever</span>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Great for getting started.</p>
            </div>
            <ul className="space-y-2 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex gap-2 text-sm">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>checkmark</span>
                  <span style={{ color: "var(--text-muted)" }}>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/login")} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80" style={{ border: "1.5px solid var(--border)", color: "var(--text-muted)" }}>
              {user ? "Current plan" : "Get started free"}
            </button>
          </div>

          <div className="rounded-2xl p-6 flex flex-col gap-4 relative" style={{ background: "var(--primary)", color: "#fff" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#fff", color: "var(--primary)" }}>
              Most popular
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-70">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{annual ? "$39.99" : "$4.99"}</span>
                <span className="text-sm opacity-70">{annual ? "/year" : "/month"}</span>
              </div>
              {annual && <p className="text-xs mt-1 opacity-60">approx $3.33/month</p>}
              <p className="text-xs mt-2 opacity-70">For serious students.</p>
            </div>
            <ul className="space-y-2 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex gap-2 text-sm">
                  <span className="font-bold opacity-90">checkmark</span>
                  <span className="opacity-90">{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <button disabled className="w-full py-2.5 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed" style={{ background: "#fff", color: "var(--primary)" }}>
                Active plan
              </button>
            ) : (
              <button onClick={handleGetPro} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[.98]" style={{ background: "#fff", color: "var(--primary)" }}>
                Get Pro
              </button>
            )}
          </div>

          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "linear-gradient(135deg, var(--primary-muted) 0%, var(--surface) 100%)", border: "1.5px dashed var(--primary-lt)" }}>
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-3" style={{ background: "var(--primary-lt)", color: "var(--primary)" }}>
                Free trial
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>3-Day Pro Trial</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold" style={{ color: "var(--text)" }}>$0</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>for 3 days</span>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Try every Pro feature free. No credit card.</p>
            </div>
            <ul className="space-y-2 flex-1">
              {["Full Pro access for 3 days", "All analytics unlocked", "No credit card required", "Cancel anytime"].map(f => (
                <li key={f} className="flex gap-2 text-sm">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>checkmark</span>
                  <span style={{ color: "var(--text-muted)" }}>{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <button disabled className="w-full py-2.5 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed" style={{ background: "var(--primary)", color: "#fff" }}>
                Already on Pro
              </button>
            ) : (
              <button onClick={handleTrial} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[.98]" style={{ background: "var(--primary)", color: "#fff" }}>
                {user ? "Start free trial (simulated)" : "Sign up and start trial"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: "var(--text-faint)" }}>
          Demo app — no real payment is processed.
        </p>

        <div className="mt-12">
          <h2 className="text-lg font-bold mb-5 text-center" style={{ color: "var(--text)" }}>Frequently asked</h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.q}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{openFaq === i ? "up" : "down"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
