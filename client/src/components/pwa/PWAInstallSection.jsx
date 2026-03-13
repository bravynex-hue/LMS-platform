// no additional React hooks needed
import { ArrowDownToLine, CheckCircle2, Smartphone, Apple, MonitorSmartphone } from "lucide-react";
import { usePWAInstall } from "@/pwa/usePWAInstall";

function Step({ children }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#22c55e" }} />
      <span>{children}</span>
    </li>
  );
}

function PlatformBadge({ platform }) {
  if (platform === "android") {
    return (
      <Smartphone className="w-5 h-5" aria-hidden="true" />
    );
  }

  if (platform === "desktop") {
    return (
      <MonitorSmartphone className="w-5 h-5" aria-hidden="true" />
    );
  }

  // iOS
  return <Apple className="w-5 h-5" aria-hidden="true" />;
}

function Card({ title, subtitle, icon, accent, badgeText, children }) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-7 border backdrop-blur"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
        borderColor: "rgba(255,255,255,0.10)",
        boxShadow: "0 28px 90px rgba(2, 6, 23, 0.65)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div
          className="flex items-center gap-3 min-w-0"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${accent}40, transparent 60%), linear-gradient(135deg, ${accent}26, rgba(255,255,255,0.03))`,
              border: `1px solid ${accent}55`,
              boxShadow: `0 18px 45px ${accent}20`,
              color: accent,
            }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight" style={{ color: "#f8fafc" }}>
              {title}
            </p>
            <p className="text-xs sm:text-sm" style={{ color: "#94a3b8" }}>
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className="text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0"
          style={{
            color: "#e2e8f0",
            background: "rgba(2,6,23,0.25)",
            borderColor: "rgba(255,255,255,0.14)",
          }}
        >
          {badgeText}
        </span>
      </div>
      {children}
    </div>
  );
}

function getDeviceKind() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || navigator.vendor || "";

  const isiOSMobile =
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
  if (isiOSMobile) return "ios";

  if (/Android/.test(ua)) return "android";

  return "desktop";
}

export default function PWAInstallSection() {
  const { isIOS, isStandalone, canPromptInstall, promptInstall, isPreparing } = usePWAInstall();
  const deviceKind = getDeviceKind();
  const isAndroidEnv = deviceKind === "android";
  const isIOSEnv = deviceKind === "ios";
  const isDesktopEnv = deviceKind === "desktop";

  return (
    <section className="relative py-28 px-6 sm:px-8 overflow-hidden" style={{ background: "var(--bg-dark)" }}>
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="orb orb-blue absolute w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at center, rgba(99,102,241,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10 fade-up">
        <div className="text-center mb-12">
          <span className="section-badge mb-6 inline-flex">
            <ArrowDownToLine className="w-3 h-3" />
            Install Bravynex
          </span>

          <h2 className="text-3xl sm:text-5xl font-black leading-tight mt-5 mb-3" style={{ color: "#f0f9ff" }}>
            Download{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bravynex
            </span>
          </h2>

          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "#a3b2c7" }}>
            Install Bravynex on your favorite device. Launch from your Home Screen and keep learning even when you&apos;re offline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Android"
            subtitle="Chrome on Android"
            icon={<PlatformBadge platform="android" />}
            accent="#22c55e"
            badgeText="Recommended"
          >
            <p className="text-sm mb-4" style={{ color: "#cbd5e1" }}>
              Install the Bravynex Android app and access courses anywhere, even when you&apos;re offline.
            </p>
            <button
              type="button"
              disabled={isStandalone || !isAndroidEnv || isPreparing}
              onClick={async () => {
                if (!isAndroidEnv || isStandalone || isPreparing) return;

                if (canPromptInstall) {
                  const result = await promptInstall();
                  if (result.outcome === "accepted") return;
                }
                
                window.alert(
                  "On Android, open this site in Chrome, then use the menu (⋮) → \"Install app\" to add Bravynex."
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-3 group/btn"
              style={{
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                boxShadow: "0 12px 35px rgba(34,197,94,0.35)",
              }}
            >
              {isPreparing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
              )}
              {isStandalone ? "Already Installed" : isPreparing ? "Preparing..." : canPromptInstall ? "Install App Now" : "Download App"}
            </button>
            <ol className="space-y-2 list-none p-0 m-0">
              <Step>Open this site in <b style={{ color: "#f8fafc" }}>Chrome</b>.</Step>
              <Step>Tap <b style={{ color: "#f8fafc" }}>Install App</b> when prompted (or Chrome menu → <b style={{ color: "#f8fafc" }}>Install app</b>).</Step>
              <Step>Confirm to add Bravynex to your Home Screen.</Step>
            </ol>
          </Card>

          <Card
            title="iOS"
            subtitle="Safari on iPhone/iPad"
            accent="#c084fc"
            icon={<PlatformBadge platform="ios" />}
            badgeText="Manual install"
          >
            <p className="text-sm mb-4" style={{ color: "#cbd5e1" }}>
              Add Bravynex to your iPhone or iPad Home Screen for a full-screen app experience.
            </p>
            <button
              type="button"
              disabled={isStandalone || !isIOSEnv}
              onClick={() => {
                if (!isIOSEnv || isStandalone) return;
                window.alert(
                  "To install on iOS: \n1. Tap the Share icon (⎙) in Safari\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' to finish."
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-3 group/btn"
              style={{
                background: "linear-gradient(135deg, #a855f7, #c084fc)",
                boxShadow: "0 12px 35px rgba(192,132,252,0.35)",
              }}
            >
              <Smartphone className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
              {isStandalone ? "Already Installed" : "Install App"}
            </button>
            <p className="text-sm mb-2" style={{ color: "#b8c4d8" }}>
              iOS Safari doesn’t support the automatic install prompt. Install manually:
            </p>
            <ol className="space-y-2 list-none p-0 m-0">
              <Step>Tap the <b style={{ color: "#f8fafc" }}>Share</b> icon in Safari.</Step>
              <Step>Select <b style={{ color: "#f8fafc" }}>Add to Home Screen</b>.</Step>
              <Step>Tap <b style={{ color: "#f8fafc" }}>Add</b> to finish.</Step>
            </ol>
            {isIOS && !isStandalone ? (
              <div className="mt-4 text-xs" style={{ color: "#94a3b8" }}>
                Tip: After installing, open Bravynex from your Home Screen for the best full-screen experience.
              </div>
            ) : null}
          </Card>

          <Card
            title="Desktop"
            subtitle="Chrome, Edge and others"
            accent="#38bdf8"
            icon={<PlatformBadge platform="desktop" />}
            badgeText="Best for laptops"
          >
            <p className="text-sm mb-4" style={{ color: "#cbd5e1" }}>
              Use Bravynex as a desktop application with its own window and taskbar icon.
            </p>
            <button
              type="button"
              disabled={isStandalone || !isDesktopEnv || isPreparing}
              onClick={async () => {
                if (!isDesktopEnv || isStandalone || isPreparing) return;

                if (canPromptInstall) {
                  const result = await promptInstall();
                  if (result.outcome === "accepted") return;
                }
                
                window.alert(
                  "On desktop, open the browser menu (⋮ or ⋯) and choose \"Install Bravynex\" to add it as an app."
                );
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-3 group/btn"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                boxShadow: "0 12px 35px rgba(56,189,248,0.35)",
              }}
            >
              {isPreparing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
              )}
              {isStandalone ? "Already Installed" : isPreparing ? "Preparing..." : canPromptInstall ? "Install App Now" : "Install Desktop"}
            </button>
            {!canPromptInstall && !isStandalone && !isIOS ? (
              <p className="text-xs" style={{ color: "#b8c4d8" }}>
                In Chrome or Edge, open the browser menu and choose <b>Install Bravynex</b>.
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </section>
  );
}

