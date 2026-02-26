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
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { ArrowUpDownIcon, BookOpen, Filter, X, Zap, ChevronRight, Search } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SpinnerOverlay } from "@/components/ui/spinner";

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
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  
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

  const FilterContent = () => (
    <div className="space-y-8">
      {Object.keys(filterOptions).map((ketItem) => (
        <div key={ketItem} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 px-2">
            {ketItem}
          </h3>
          <div className="space-y-1">
            {filterOptions[ketItem].map((option) => (
              <Label 
                key={`${ketItem}-${option.id}`} 
                className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2.5 rounded-xl transition-all duration-200 group"
              >
                <Checkbox
                  checked={
                    filters && filters[ketItem] && filters[ketItem].indexOf(option.id) > -1
                  }
                  onCheckedChange={() => handleFilterOnChange(ketItem, option)}
                  className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
                  {option.label}
                </span>
              </Label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const fetchAllStudentViewCourses = useCallback(async (filtersArg, sortArg, searchArg) => {
    setLoadingState(true);
    const query = new URLSearchParams({
      ...filtersArg,
      sortBy: sortArg,
      ...(searchArg ? { search: searchArg } : {}),
    });
    const response = await fetchStudentViewCourseListService(query.toString());
    if (response?.success) {
      setStudentViewCoursesList(response?.data);
      setLoadingState(false);
    }
  }, [setStudentViewCoursesList, setLoadingState]);

  async function handleCourseNavigate(getCurrentCourseId) {
    if (!auth?.authenticate) return navigate('/auth?tab=signin');
    const response = await checkCoursePurchaseInfoService(getCurrentCourseId, auth?.user?._id);
    if (response?.success) {
      if (response?.data) navigate(`/student-courses`);
      else navigate(`/course/details/${getCurrentCourseId}`);
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

  useEffect(() => {
    return () => sessionStorage.removeItem("filters");
  }, []);

  return (
    <div className="min-h-screen text-gray-200" style={{ background: "var(--bg-dark)" }}>
      {/* Background orbs */}
      <div className="orb orb-blue absolute w-[600px] h-[600px] -top-80 -right-20 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.07] pointer-events-none" />

      {/* Page Header */}
      <div className="relative pt-24 pb-12 px-6 lg:px-12 border-b border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <span className="section-badge">
              <BookOpen className="w-3 h-3" />
              Catalogue
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Explore Our <br />
              <span style={{ background: "linear-gradient(135deg, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Technology Courses</span>
            </h1>
            <p className="text-gray-400 max-w-lg">
              Master the skills of the future with our industry-led internship programs and specialized tracks.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="glass-card px-4 py-2 border-white/10 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 italic">
                  {searchTerm ? `Searching for "${searchTerm}"` : "Global Search Active"}
                </span>
             </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 space-y-6">
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
                className="flex-1 glass-card border-white/10 bg-white/5 flex items-center gap-2 py-6 text-gray-400"
             >
                <Filter className="w-4 h-4" />
                Filters
                {Object.keys(filters).length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500" />}
             </Button>
             
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex-1 glass-card border-white/10 bg-white/5 flex items-center gap-2 py-6 text-gray-400">
                    <ArrowUpDownIcon className="w-4 h-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0a0a0c] border border-white/10 text-gray-300">
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
            <DialogContent className="bg-[#0a1428] border-white/10 text-gray-200 max-h-[90vh] overflow-y-auto">
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
               <div className="hidden lg:block bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2">
                 <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-transparent text-sm font-bold text-gray-400 focus:outline-none appearance-none cursor-pointer pr-6"
                    style={{ background: "url('data:image/svg+xml;utf8,<svg fill=\"%23666\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>') no-repeat right center" }}
                 >
                   {sortOptions.map(o => <option key={o.id} value={o.id} className="bg-[#0a0a0c]">{o.label}</option>)}
                 </select>
               </div>
            </div>

            {loadingState ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                 <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                 <span className="text-gray-500 font-bold tracking-widest uppercase text-xs">Accessing Database...</span>
              </div>
            ) : studentViewCoursesList?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {studentViewCoursesList.slice(0, visibleResults).map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleCourseNavigate(c._id)}
                    className="glass-card group flex flex-col h-full overflow-hidden border-white/10 hover:border-blue-500/30 transition-all duration-500 cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black tracking-widest uppercase border border-white/10 text-blue-400">
                          {c.level}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                         <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
                            <ChevronRight className="w-5 h-5 text-white" />
                         </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors mb-4 line-clamp-2">
                        {c.title}
                      </h3>
                      <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                          <span className="flex items-center gap-1.5 uppercase tracking-widest">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            {c.curriculum?.length || 0} Modules
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                           <span className="text-2xl font-black text-white">
                             ₹{Number(c.pricing).toLocaleString("en-IN")}
                           </span>
                           <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                             View Details
                           </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-card border-dashed border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">No Matches Found</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">None of our current programs match these specific filters. Try expanding your search criteria.</p>
                <Button onClick={handleClearFilters} className="bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-xs px-8 h-12">
                  Reset Filters
                </Button>
              </div>
            )}

            {canLoadMoreResults && (
              <div className="mt-16 flex justify-center">
                <Button
                  onClick={() => setVisibleResults((n) => n + RESULTS_CHUNK)}
                  variant="outline"
                  className="glass-card border-white/10 px-12 h-14 font-black uppercase tracking-[0.3em] text-[10px] text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Fetch More Results
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
