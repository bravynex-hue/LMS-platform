import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { filterOptions, sortOptions, courseCategories } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext, useStudent } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { ArrowUpDownIcon, BookOpen, Filter, X, Zap, ChevronRight, Search, Play, Star, Clock, FileText, Download as DownloadIcon } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState, useRef, Suspense, lazy } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SpinnerOverlay } from "@/components/ui/spinner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageTransition } from "@/hooks/use-gsap";

gsap.registerPlugin(ScrollTrigger);

function CanvasLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
       <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
    </div>
  );
}

function createSearchParamsHelper(filterParams) {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

function StudentViewCoursesPage() {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = useMemo(() => (searchParams.get("search") || "").trim(), [searchParams]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    paginationInfo,
    setPaginationInfo,
    loadingState,
    setLoadingState,
  } = useStudent();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const pageRef = usePageTransition();
  const headerRef = useRef(null);
  
  const INITIAL_RESULTS = 6;
  const RESULTS_CHUNK = 6;
  const [visibleResults, setVisibleResults] = useState(INITIAL_RESULTS);
  const canLoadMoreResults = (studentViewCoursesList?.length || 0) > visibleResults;

  useEffect(() => {
    setVisibleResults(INITIAL_RESULTS);
  }, [studentViewCoursesList]);

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    if (!cpyFilters[getSectionId]) {
      cpyFilters[getSectionId] = [getCurrentOption.id];
    } else {
      const index = cpyFilters[getSectionId].indexOf(getCurrentOption.id);
      if (index === -1) cpyFilters[getSectionId].push(getCurrentOption.id);
      else cpyFilters[getSectionId].splice(index, 1);
    }
    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleClearFilters() {
    setFilters({});
    sessionStorage.removeItem("filters");
  }

  const FilterContent = () => {
    const sectionIcons = {
      category: <BookOpen className="w-3.5 h-3.5" />,
      level: <Star className="w-3.5 h-3.5" />,
      primaryLanguage: <Zap className="w-3.5 h-3.5" />,
      duration: <Clock className="w-3.5 h-3.5" />,
    };

    return (
      <div className="space-y-10">
        {Object.keys(filterOptions)
          // Hide internship duration filter from UI; duration still visible on course cards
          .filter((ketItem) => ketItem !== "duration")
          .map((ketItem) => (
          <div key={ketItem} className="relative">
            <div className="flex items-center gap-2.5 mb-5 px-1">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {sectionIcons[ketItem] || <Filter className="w-3.5 h-3.5" />}
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                {ketItem === "duration" 
                  ? "Internship Duration" 
                  : ketItem === "primaryLanguage" 
                    ? "Primary Language" 
                    : ketItem.charAt(0).toUpperCase() + ketItem.slice(1)}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {filterOptions[ketItem].map((option) => {
                const isActive = filters && filters[ketItem] && filters[ketItem].indexOf(option.id) > -1;
                return (
                  <Label 
                    key={`${ketItem}-${option.id}`} 
                    className={`relative flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl border transition-all duration-300 group
                      ${isActive 
                        ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'}`}
                  >
                    <div className="relative flex items-center justify-center">
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => handleFilterOnChange(ketItem, option)}
                        className={`w-5 h-5 border-2 rounded-md transition-all duration-300
                          ${isActive 
                            ? 'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                            : 'bg-transparent border-white/20 group-hover:border-white/40'}`}
                      />
                      {isActive && <div className="absolute inset-0 bg-blue-400 blur-sm opacity-50 rounded-md animate-pulse pointer-events-none" />}
                    </div>
                    
                    <div className="flex-1">
                       <span className={`text-[13px] font-bold tracking-tight transition-colors duration-300
                         ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                         {option.label}
                       </span>
                    </div>

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    )}
                  </Label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const fetchAllStudentViewCourses = useCallback(async (filtersArg, sortArg, searchArg) => {
    setLoadingState(true);
    const buildQueryString = createSearchParamsHelper(filtersArg);
    const query = new URLSearchParams(buildQueryString);
    query.set("sortBy", sortArg);
    if (searchArg) query.set("search", searchArg);

    const response = await fetchStudentViewCourseListService(query.toString());
    if (response?.success) {
      setStudentViewCoursesList(response?.data?.courses || []);
      setPaginationInfo({
        totalCount: response?.data?.totalCount || 0,
        totalPages: response?.data?.totalPages || 0,
        currentPage: response?.data?.currentPage || 1
      });
      setLoadingState(false);
    }
  }, [setStudentViewCoursesList, setPaginationInfo, setLoadingState]);

  async function handleCourseNavigate(getCurrentCourseId) {
    if (!auth?.authenticate) {
      navigate(`/course/details/${getCurrentCourseId}`);
      return;
    }
    const response = await checkCoursePurchaseInfoService(getCurrentCourseId, auth?.user?._id);
    if (response?.success) {
      if (response?.data) navigate(`/student-courses`);
      else navigate(`/course/details/${getCurrentCourseId}`);
    } else {
      navigate(`/course/details/${getCurrentCourseId}`);
    }
  }

  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    const next = new URLSearchParams(buildQueryStringForFilters);
    if (searchTerm) next.set("search", searchTerm);
    setSearchParams(next);
  }, [filters, setSearchParams, searchTerm]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null)
      fetchAllStudentViewCourses(filters, sort, searchTerm);
  }, [filters, sort, searchTerm, fetchAllStudentViewCourses]);

  useEffect(() => {
    setVisibleResults(INITIAL_RESULTS);
  }, [searchTerm]);

  // GSAP Animations
  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const isReload = navEntry ? navEntry.type === "reload" : performance.navigation?.type === 1;
    if (isReload) pageRef.enter("fade");

    // Animations removed to prevent 'jumping' and improve stability
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loadingState, studentViewCoursesList?.length, pageRef]);

  useEffect(() => {
    return () => sessionStorage.removeItem("filters");
  }, []);

  return (
    <div className="relative w-full text-gray-200" style={{ background: "var(--bg-dark)" }}>
      {/* Background elements (static only, no 3D animation) */}
      <div className="orb orb-blue absolute w-[800px] h-[800px] -top-96 -right-40 opacity-[0.04] pointer-events-none" />
      <div className="orb orb-purple absolute w-[600px] h-[600px] bottom-0 -left-20 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.08] pointer-events-none" />

      {/* Page Header */}
      <div 
        ref={headerRef}
        className="relative pt-24 pb-12 px-6 lg:px-12 border-b border-white/5 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10 px-6 lg:px-12">
          <div className="space-y-6">
            <span className="section-badge page-badge-anim">
              <BookOpen className="w-3 h-3" />
              Catalogue
            </span>
            <h1 className="page-title-anim text-4xl sm:text-6xl font-black text-white leading-[1.1]">
              Explore Our <br />
              <span style={{ background: "linear-gradient(135deg, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Technology Tracks</span>
            </h1>
            <p className="page-desc-anim text-gray-400 max-w-xl text-lg leading-relaxed">
              Master the skills of the future with our industry-led internship programs, 
              live projects, and expert-curated technical tracks.
            </p>
          </div>
          <div className="flex items-center gap-3 fade-in mt-4 md:mt-0">
             <div className="glass-card px-6 py-3 border-white/10 flex items-center gap-3 backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-bold text-gray-400">
                  {searchTerm ? `Results for "${searchTerm}"` : "Active Registry Dynamic"}
                </span>
             </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 space-y-6 filter-aside-anim">
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  Filters
                </h2>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-gray-500 hover:text-blue-400 transition-colors uppercase font-black tracking-widest"
                >
                  Reset
                </button>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Filter & Sort Bar */}
          <div className="lg:hidden flex gap-3 mb-6">
             <Button
                onClick={() => setIsFilterDialogOpen(true)}
                variant="ghost"
                className="flex-1 glass-card border-white/10 bg-white/5 flex items-center justify-center gap-2 py-6 text-gray-400"
             >
                <Filter className="w-4 h-4" />
                Filters
                {Object.keys(filters).length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500" />}
             </Button>
             
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex-1 glass-card border-white/10 bg-white/5 flex items-center justify-center gap-2 py-6 text-gray-400">
                    <ArrowUpDownIcon className="w-4 h-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] z-[100] bg-[#0a0a0c] border border-white/10 text-gray-300">
                   <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                      {sortOptions.map(o => (
                        <DropdownMenuRadioItem key={o.id} value={o.id} className="focus:bg-white/5 cursor-pointer">
                          {o.label}
                        </DropdownMenuRadioItem>
                      ))}
                   </DropdownMenuRadioGroup>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>

          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogContent className="bg-[#0a1428] border-white/10 text-gray-200 w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 z-[100]">
              <DialogHeader>
                <DialogTitle className="text-white font-black uppercase tracking-tighter">Adjust Filters</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <FilterContent />
              </div>
              <Button onClick={() => setIsFilterDialogOpen(false)} className="bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest">
                Apply Filters
              </Button>
            </DialogContent>
          </Dialog>

          {/* Results Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-8">
               <span className="text-xs font-bold tracking-widest text-gray-600 uppercase">
                 Showing {Math.min(visibleResults, studentViewCoursesList.length)} of {studentViewCoursesList.length} Courses
               </span>
               {/* Refined Sort Dropdown (Premium UI) */}
               <div className="hidden lg:block">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="bg-white/5 border border-white/10 hover:bg-white/10 h-10 px-4 rounded-xl flex items-center gap-2 transition-all">
                        <ArrowUpDownIcon className="w-3.5 h-3.5 text-blue-400/80" />
                        <span className="text-xs font-bold text-gray-400">
                          {sortOptions.find(o => o.id === sort)?.label || "Sort"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 glass-dropdown border-white/10 mt-2 p-1">
                       <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                          {sortOptions.map(option => (
                             <DropdownMenuRadioItem 
                                key={option.id} 
                                value={option.id}
                                className="text-xs text-gray-400 focus:text-white focus:bg-white/5 cursor-pointer py-2.5 rounded-lg"
                             >
                                {option.label}
                             </DropdownMenuRadioItem>
                          ))}
                       </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>
               </div>
            </div>

            {loadingState ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-10">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-purple-500/10 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                  <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-full" />
                </div>
                <div className="space-y-2 text-center">
                  <span className="block text-[10px] font-black tracking-[0.4em] uppercase text-blue-500/60 animate-pulse">Initializing Hub</span>
                  <p className="text-gray-500 font-bold tracking-widest uppercase text-[11px]">Synchronizing Active Registry...</p>
                </div>
              </div>
            ) : studentViewCoursesList?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {studentViewCoursesList.slice(0, visibleResults).map((c, index) => (
                  <div
                    key={c._id}
                    onClick={() => handleCourseNavigate(c._id)}
                    className="course-card-anim relative group cursor-pointer animate-on-scroll"
                  >
                    {/* Dynamic Ambient Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-1000 pointer-events-none" />
                    
                    <div className="relative h-full flex flex-col bg-[#0f172a]/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden group-hover:border-blue-500/20 group-hover:bg-[#0f172a]/60 transition-all duration-500 ease-out">
                      
                      {/* Image Frame with Cinematic Zoom */}
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={c.image} 
                          alt={c.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-transparent to-transparent group-hover:opacity-60 transition-opacity duration-500" />
                        
                        {/* Elite Level Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="px-3 py-1 bg-blue-600/90 text-[8px] font-black tracking-widest uppercase rounded-full border border-blue-400/30">
                            {c.level}
                          </div>
                        </div>

                        {/* Interactive Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100">
                           <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white/20" />
                           </div>
                        </div>
                      </div>
                      
                      {/* Premium Content Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                              {c.category.replace("-", " ")}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-blue-200 transition-colors leading-[1.3] line-clamp-2">
                            {c.title}
                          </h3>
                        </div>

                        {/* Metadata Pills */}
                        <div className="mt-auto space-y-4">
                          <div className="flex items-center gap-2">
                             <div className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 group-hover:bg-white/[0.06] transition-colors">
                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] font-bold text-gray-400 capitalize truncate">
                                  {c.curriculum?.length || 0} Modules
                                </span>
                             </div>
                             {c.duration && (
                               <div className="flex-1 px-3 py-2 rounded-xl bg-purple-500/[0.07] border border-purple-500/10 flex items-center gap-2 group-hover:bg-purple-500/[0.12] transition-colors">
                                 <Zap className="w-3.5 h-3.5 text-purple-400" />
                                 <span className="text-[10px] font-bold text-purple-300 truncate">
                                   {c.duration.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                 </span>
                               </div>
                             )}
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                             <div className="flex flex-col">
                               <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Tuition Fee</span>
                               <span className="text-lg font-black text-white flex items-baseline leading-none">
                                 <span className="text-[11px] font-bold text-blue-400 mr-0.5">₹</span>
                                 {Number(c.pricing).toLocaleString("en-IN")}
                               </span>
                             </div>
                             <div className="flex items-center gap-1.5">
                               {c.brochureUrl && (
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     let url = c.brochureUrl;
                                     if (!url) return;
                                     
                                     // Ensure HTTPS for cross-origin downloads
                                     if (url.startsWith('http://')) {
                                       url = url.replace('http://', 'https://');
                                     }

                                     if (url.includes('/upload/') && !url.includes('/upload/fl_attachment/')) {
                                       url = url.replace('/upload/', '/upload/fl_attachment/');
                                     }
                                     const link = document.createElement("a");
                                     link.href = url;
                                     // Use _self to trigger direct download and avoid blank loading tabs in browsers
                                     link.target = "_self";
                                     link.download = c.brochureFileName || "course-brochure.pdf";
                                     document.body.appendChild(link);
                                     link.click();
                                     document.body.removeChild(link);
                                   }}
                                   className="h-8 px-2.5 rounded-lg relative group/brochure overflow-hidden transition-all duration-500 border border-blue-500/30 hover:border-blue-400 bg-white/[0.05] backdrop-blur-md flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] active:scale-95"
                                   title="Download Brochure"
                                 >
                                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/brochure:translate-x-full transition-transform duration-1000 ease-in-out" />
                                   
                                   <FileText className="w-3 h-3 text-blue-400 group-hover/brochure:scale-110 transition-transform duration-300 relative z-10" />
                                   <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover/brochure:text-white transition-colors hidden sm:inline relative z-10">Brochure</span>
                                   <DownloadIcon className="w-2.5 h-2.5 text-blue-400 opacity-0 -translate-y-1 group-hover/brochure:opacity-100 group-hover/brochure:translate-y-0 transition-all duration-500 relative z-10" />
                                 </button>
                               )}
                               <button 
                                 className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center hover:bg-blue-600 hover:border-blue-400 transition-all duration-500 transform hover:rotate-6 shadow-lg shadow-blue-900/40 active:scale-90 group/access"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleCourseNavigate(c._id);
                                 }}
                               >
                                 <ChevronRight className="w-4 h-4 text-blue-400 group-hover/access:text-white transition-all duration-300 group-hover/access:scale-110" />
                               </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-card border-dashed border-white/10 rounded-[3rem]">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                  <Zap className="w-10 h-10 text-gray-700" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">No Programs Syncing</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">None of our current technical tracks match these specific search parameters. Try expanding your registry criteria.</p>
                <Button onClick={handleClearFilters} className="bg-blue-600 text-white hover:bg-blue-500 font-black uppercase tracking-widest text-xs px-10 h-14 rounded-2xl shadow-xl transition-all">
                  Synchronize Filters
                </Button>
              </div>
            )}

            {canLoadMoreResults && (
              <div className="mt-20 flex justify-center">
                <Button
                  onClick={() => setVisibleResults((n) => n + RESULTS_CHUNK)}
                  variant="outline"
                  className="bg-white/5 border-white/10 px-16 h-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] text-gray-400 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
                >
                  Access More Data
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default StudentViewCoursesPage;
