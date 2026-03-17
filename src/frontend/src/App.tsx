import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Clock,
  Flag,
  History,
  Info,
  LayoutDashboard,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SpamResult } from "./backend.d";
import {
  useAnalyzeMessage,
  useClearHistory,
  useHistory,
} from "./hooks/useQueries";

// Disable unused Badge warning - it's available for future use
void Badge;

// ─── Semicircle Gauge ────────────────────────────────────────────────────────
function SemicircleGauge({
  value,
  isSpam,
}: {
  value: number;
  isSpam: boolean;
}) {
  const radius = 72;
  const stroke = 10;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  const trackColor = "oklch(0.20 0.012 240)";
  const arcColor = isSpam ? "oklch(0.55 0.22 25)" : "oklch(0.72 0.18 145)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        role="img"
        aria-label="Confidence gauge"
        width="180"
        height="100"
        viewBox="0 0 180 100"
        className="overflow-visible"
      >
        <title>Confidence gauge: {value}%</title>
        {/* Track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={arcColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out, stroke 0.3s ease",
          }}
        />
        {/* Center text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fontFamily="Satoshi, sans-serif"
          fill={arcColor}
        >
          {value}%
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Satoshi, sans-serif"
          fill="oklch(0.60 0.01 240)"
        >
          confidence
        </text>
      </svg>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ isSpam }: { isSpam: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
        isSpam
          ? "bg-destructive/15 text-destructive border border-destructive/30"
          : "bg-success/15 text-success border border-success/30"
      }`}
    >
      {isSpam ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <CheckCircle2 className="w-3 h-3" />
      )}
      {isSpam ? "Detected: Spam" : "Safe: Legitimate"}
    </span>
  );
}

// ─── Relative time ────────────────────────────────────────────────────────────
function relativeTime(nanoTimestamp: bigint): string {
  const ms = Number(nanoTimestamp / 1_000_000n);
  const diff = Date.now() - ms;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
type Tab = "dashboard" | "analysis" | "history";

function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: <BarChart2 className="w-3.5 h-3.5" />,
    },
    {
      id: "history",
      label: "History",
      icon: <History className="w-3.5 h-3.5" />,
    },
  ];
  return (
    <header
      className="flex items-center justify-between px-6 py-3.5 border-b border-border"
      style={{ background: "oklch(0.14 0.012 240)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-base text-foreground tracking-tight">
          SpamShield <span className="text-primary">AI</span>
        </span>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            data-ocid={`nav.${t.id}.tab`}
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {/* Right */}
      <a
        href="https://caffeine.ai"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        data-ocid="nav.about.link"
      >
        <Info className="w-4 h-4" />
        About
      </a>
    </header>
  );
}

// ─── Analyze Panel ────────────────────────────────────────────────────────────
function AnalyzePanel({
  onResult,
}: {
  onResult: (r: SpamResult) => void;
}) {
  const [text, setText] = useState("");
  const analyze = useAnalyzeMessage();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    try {
      const result = await analyze.mutateAsync(text);
      onResult(result);
    } catch {
      toast.error("Analysis failed. Please try again.");
    }
  };

  const handleClear = () => setText("");

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Analyze New Message
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Paste or type a message to check for spam
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Textarea
          data-ocid="analyze.textarea"
          placeholder={`Paste your email or message content here...\n\nExample: Congratulations! You've been selected for a $1,000 gift card. Click here to claim your prize immediately!`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 min-h-[200px] resize-none text-sm leading-relaxed"
          style={{
            background: "oklch(0.10 0.006 240)",
            border: "1px solid oklch(0.25 0.018 240)",
          }}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {text.length} characters
          </span>
          {text.length > 0 && (
            <button
              type="button"
              data-ocid="analyze.clear.button"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <Button
        data-ocid="analyze.submit_button"
        onClick={handleAnalyze}
        disabled={analyze.isPending || !text.trim()}
        className="w-full h-11 font-semibold text-sm"
        style={{
          background:
            analyze.isPending || !text.trim()
              ? undefined
              : "oklch(0.60 0.18 250)",
        }}
      >
        {analyze.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Analyze Message
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Results Panel ────────────────────────────────────────────────────────────
function ResultsPanel({ result }: { result: SpamResult | null }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Analysis Results
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI-powered spam classification
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="results.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <BarChart2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                No analysis yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Submit a message to see results
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            data-ocid="results.panel"
            className="flex-1 flex flex-col gap-4"
          >
            {/* Status pill */}
            <div className="flex items-center justify-between">
              <StatusBadge isSpam={result.isSpam} />
              <span className="text-xs text-muted-foreground">
                Score: {Number(result.score)}
              </span>
            </div>

            {/* Verdict headline */}
            <div>
              <h3
                className={`text-2xl font-bold ${
                  result.isSpam ? "text-destructive" : "text-success"
                }`}
              >
                {result.isSpam ? "Spam Detected" : "Looks Legitimate"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(result.confidence)}% confidence in this
                classification
              </p>
            </div>

            {/* Gauge */}
            <div className="flex justify-center">
              <SemicircleGauge
                value={Math.round(result.confidence)}
                isSpam={result.isSpam}
              />
            </div>

            {/* Indicators */}
            {result.reasons.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Detected Indicators
                </p>
                <ScrollArea className="max-h-36">
                  <div
                    className="flex flex-col gap-1.5"
                    data-ocid="results.list"
                  >
                    {result.reasons.map((reason, i) => (
                      <div
                        key={reason}
                        data-ocid={`results.item.${i + 1}`}
                        className="flex items-start gap-2 text-xs text-foreground/80"
                      >
                        <Flag
                          className={`w-3 h-3 mt-0.5 shrink-0 ${
                            result.isSpam ? "text-destructive" : "text-success"
                          }`}
                        />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel() {
  const { data: history = [], isLoading } = useHistory();
  const clearHistory = useClearHistory();

  const handleClear = async () => {
    try {
      await clearHistory.mutateAsync();
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Analysis History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {history.length} messages analyzed
          </p>
        </div>
        <Button
          data-ocid="history.clear.button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={clearHistory.isPending || history.length === 0}
          className="h-8 text-xs gap-1.5 border-border text-muted-foreground hover:text-destructive hover:border-destructive/50"
        >
          {clearHistory.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
          Clear History
        </Button>
      </div>

      {history.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="flex-1 flex flex-col items-center justify-center gap-2 text-center"
        >
          <History className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            No messages analyzed yet
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 pr-1" data-ocid="history.list">
            {history.map((entry, i) => (
              <motion.div
                key={String(entry.id)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`history.item.${i + 1}`}
                className="p-3 rounded-lg border border-border hover:border-border/80 transition-colors cursor-default"
                style={{ background: "oklch(0.12 0.008 240)" }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <StatusBadge isSpam={entry.isSpam} />
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    {relativeTime(entry.timestamp)}
                  </div>
                </div>
                <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
                  {entry.snippet}
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  <div
                    className={`h-1 rounded-full flex-1 ${
                      entry.isSpam ? "bg-destructive/20" : "bg-success/20"
                    }`}
                  >
                    <div
                      className={`h-1 rounded-full ${
                        entry.isSpam ? "bg-destructive" : "bg-success"
                      }`}
                      style={{ width: `${Math.round(entry.confidence)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">
                    {Math.round(entry.confidence)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [result, setResult] = useState<SpamResult | null>(null);

  const year = new Date().getFullYear();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-4 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.11 0.008 240) 0%, oklch(0.13 0.01 245) 100%)",
      }}
    >
      {/* App canvas */}
      <div
        className="w-full max-w-[1280px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "oklch(0.13 0.008 240)",
          boxShadow:
            "0 8px 64px 0 rgba(0,0,0,0.6), 0 0 0 1px oklch(0.25 0.018 240)",
          minHeight: "calc(100vh - 4rem)",
        }}
      >
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main content */}
        <main className="flex-1 p-5 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Analyze */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-5 rounded-xl border border-border flex flex-col"
              style={{
                background: "oklch(0.16 0.010 240)",
                boxShadow: "0 2px 16px 0 rgba(0,0,0,0.3)",
                minHeight: "460px",
              }}
            >
              <AnalyzePanel onResult={setResult} />
            </motion.div>

            {/* Middle: Results */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl border border-border flex flex-col"
              style={{
                background: "oklch(0.16 0.010 240)",
                boxShadow: "0 2px 16px 0 rgba(0,0,0,0.3)",
                minHeight: "460px",
              }}
            >
              <ResultsPanel result={result} />
            </motion.div>

            {/* Right: History */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-xl border border-border flex flex-col"
              style={{
                background: "oklch(0.16 0.010 240)",
                boxShadow: "0 2px 16px 0 rgba(0,0,0,0.3)",
                minHeight: "460px",
              }}
            >
              <HistoryPanel />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground transition-colors">
              Privacy Policy
            </span>
            <span className="cursor-pointer hover:text-foreground transition-colors">
              Terms of Service
            </span>
            <span className="cursor-pointer hover:text-foreground transition-colors">
              Contact Us
            </span>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
