import { useContext, useState, useRef, useEffect } from "react";
import { 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Calendar,
  Bell,
  User,
  Settings,
  HelpCircle
} from "lucide-react";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

export default function DashboardLayout({ 
  children, 
  menuItems = [], 
  currentView, 
  setCurrentView,
  portalName = "Portal",
  portalIcon: PortalIcon,
  searchQuery,
  setSearchQuery,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const { logout, auth } = useContext(AuthContext);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      sidebarRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
    );

    tl.fromTo(
      headerRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );

    tl.fromTo(
      mainContentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  return (
    <div className="flex h-screen bg-[#020617] text-[#f0f9ff] relative overflow-hidden font-inter selection:bg-blue-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#050e24]/80 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isSidebarCollapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-5 border-b border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-10 h-10 bg-[#0f172a] border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
                  {PortalIcon && <PortalIcon className="w-5 h-5 text-blue-400" />}
                </div>
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-black bg-gradient-to-r from-white via-blue-200 to-gray-400 bg-clip-text text-transparent uppercase tracking-[0.2em] animate-gradient">
                    {portalName}
                  </p>
                  <p className="text-[10px] text-blue-400 font-medium tracking-widest opacity-80">MANAGEMENT</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all duration-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 overflow-y-auto space-y-8 custom-scrollbar">
            <div className="space-y-2">
              {!isSidebarCollapsed && (
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] px-3 mb-4">
                  Navigation
                </h4>
              )}
              <ul className="space-y-1.5">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center ${
                        isSidebarCollapsed ? "justify-center" : "gap-4"
                      } w-full px-3 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                        currentView === item.id
                          ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {currentView === item.id && (
                        <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      )}
                      
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        currentView === item.id 
                          ? "bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20" 
                          : "bg-white/5 group-hover:bg-white/10 group-hover:scale-110"
                      }`}>
                        <item.icon className="w-4.5 h-4.5" />
                      </div>
                      
                      {!isSidebarCollapsed && (
                        <span className={`text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                          currentView === item.id ? "translate-x-1" : ""
                        }`}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-5 mt-auto border-t border-white/5 bg-black/20">
            <div className={`flex flex-col gap-4 ${isSidebarCollapsed ? "items-center" : ""}`}>
              <button
                onClick={handleLogout}
                className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-4"} w-full px-4 py-4 rounded-2xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group`}
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/5 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
                  <LogOut className="w-4 h-4" />
                </div>
                {!isSidebarCollapsed && <span className="text-[13px] font-bold tracking-wider">Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header ref={headerRef} className="h-20 bg-[#020617]/40 backdrop-blur-md border-b border-white/5 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">
                  {menuItems.find(i => i.id === currentView)?.label || "Overview"}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-10">
            {setSearchQuery && (
              <div className="relative hidden md:block group">
                <div className="absolute inset-0 bg-blue-500/5 blur-xl group-focus-within:bg-blue-500/10 transition-all" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative bg-white/5 border border-white/10 text-sm text-white pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-64 lg:w-80 transition-all placeholder:text-gray-600 outline-none"
                />
              </div>
            )}
            
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <button className="relative p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </button>
              
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative h-11 w-11 rounded-full bg-[#0f172a] border border-white/20 flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-black text-white">{auth?.user?.userName?.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="hidden xl:block">
                  <p className="text-sm font-black text-white leading-none mb-1">{auth?.user?.userName}</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{auth?.user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
