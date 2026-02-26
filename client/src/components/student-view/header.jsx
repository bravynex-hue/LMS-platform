import {
  TvMinimalPlay,
  BookOpen,
  Search,
  User,
  LogOut,
  BarChart3,
  HelpCircle,
  Zap,
  X,
  Menu,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import logoImage from "/images/logo.png";

const NAV_LINKS = [
  { label: "Home", path: "/home" },
  { label: "Explore", path: "/courses" },
  { label: "Support", path: "/feedback-support" },
  { label: "About", path: "/about" },
];

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetCredentials, auth, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    if (typeof logout === "function") logout();
    else { resetCredentials(); sessionStorage.clear(); }
    navigate("/auth?tab=signin");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const term = (searchTerm || "").trim();
    if (!term) return;
    navigate(`/courses?search=${encodeURIComponent(term)}`);
    setMobileMenuOpen(false);
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-nav">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(168,85,247,0.5), transparent)" }} />

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────── */}
          <Link
            to="/home"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="BRAVYNEX Home"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                boxShadow: "0 0 15px rgba(59,130,246,0.35)",
              }}
            >
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-lg font-black tracking-tighter"
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                BRAVYNEX
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-60" style={{ color: "#94a3b8" }}>
                Engineering
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ──────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(path) ? "#60a5fa" : "#94a3b8",
                  background: isActive(path) ? "rgba(59,130,246,0.08)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(path)) {
                    e.currentTarget.style.color = "#bfdbfe";
                    e.currentTarget.style.background = "rgba(59,130,246,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(path)) {
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {label}
                {isActive(path) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, #3b82f6, #a855f7)" }} />
                )}
              </button>
            ))}
          </nav>

          {/* ── Desktop Search ───────────────────── */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center gap-2 flex-1 max-w-xs lg:max-w-sm"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "#475569" }} />
              <input
                id="header-search"
                type="search"
                aria-label="Search courses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="input-dark w-full h-9 pl-9 pr-3 text-sm"
                style={{ fontSize: "0.8125rem" }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary h-9 px-4 rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* ── Right Actions ────────────────────── */}
          <div className="flex items-center gap-2">
            {auth?.authenticate ? (
              <>
                {/* My Courses button */}
                <button
                  onClick={() => navigate("/student-courses")}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: "rgba(59,130,246,0.06)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    color: "#93c5fd",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.06)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; }}
                >
                  <TvMinimalPlay className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">My Courses</span>
                </button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200"
                      style={{
                        background: "rgba(10,22,40,0.8)",
                        border: "1px solid rgba(59,130,246,0.15)",
                        color: "#f0f9ff",
                      }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}>
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate"
                        style={{ color: "#94a3b8" }}>
                        {auth?.user?.userName || "Account"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                    style={{
                      background: "rgba(5,14,36,0.98)",
                      border: "1px solid rgba(59,130,246,0.15)",
                      backdropFilter: "blur(20px)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.05)",
                      color: "#f0f9ff",
                    }}
                  >
                    <DropdownMenuLabel className="px-4 py-3"
                      style={{ borderBottom: "1px solid rgba(59,130,246,0.08)" }}>
                      <div className="text-xs" style={{ color: "#475569" }}>Signed in as</div>
                      <div className="text-sm font-semibold truncate" style={{ color: "#e2e8f0" }}>
                        {auth?.user?.userEmail || auth?.user?.userName}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ background: "rgba(59,130,246,0.08)" }} />

                    {[
                      { icon: TvMinimalPlay, label: "My Courses", path: "/student-courses" },
                      { icon: HelpCircle, label: "Feedback & Support", path: "/feedback-support" },
                    ].map(({ icon: Icon, label, path }) => (
                      <DropdownMenuItem
                        key={path}
                        onClick={() => navigate(path)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150"
                        style={{ color: "#94a3b8" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "#60a5fa" }} />
                        <span className="text-sm">{label}</span>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator style={{ background: "rgba(59,130,246,0.08)" }} />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                      style={{ color: "#f87171" }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth?tab=signin")}
                  className="hidden sm:block text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#bfdbfe"; e.currentTarget.style.background = "rgba(59,130,246,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/auth?tab=signup")}
                  className="btn-primary px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold"
                >
                  Get Started
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
              style={{
                background: mobileMenuOpen ? "rgba(59,130,246,0.1)" : "transparent",
                border: "1px solid rgba(59,130,246,0.15)",
                color: "#94a3b8",
              }}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────── */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden mt-2 p-2 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300"
            style={{ 
              background: "rgba(10,22,40,0.95)", 
              border: "1px solid rgba(59,130,246,0.15)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
            }}
          >
            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 p-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "#475569" }} />
                <input
                  id="mobile-search"
                  type="search"
                  aria-label="Search courses"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  className="input-dark w-full h-10 pl-10 pr-3 text-sm"
                  style={{ fontSize: "16px" }} // Prevent iOS zoom
                />
              </div>
              <button type="submit" className="btn-primary px-4 rounded-xl text-xs font-bold uppercase tracking-wider">
                Go
              </button>
            </form>

            <DropdownMenuSeparator style={{ background: "rgba(59,130,246,0.08)", margin: "8px 0" }} />

            {/* Mobile nav links */}
            <nav className="flex flex-col p-1">
              {NAV_LINKS.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-1"
                  style={{
                    color: isActive(path) ? "#60a5fa" : "#94a3b8",
                    background: isActive(path) ? "rgba(59,130,246,0.1)" : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between">
                    {label}
                    {isActive(path) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </div>
                </button>
              ))}
              {auth?.authenticate && (
                <button
                  onClick={() => { navigate("/student-courses"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ color: "#94a3b8" }}
                >
                  My Learning
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
