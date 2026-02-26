import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IndianRupee,
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { fetchInstructorAnalyticsService } from "@/services";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ─── shared dark chart styles ─────────────────────────────────────────── */
const GRID_COLOR   = "rgba(255,255,255,0.06)";
const AXIS_COLOR   = "#4B5563";           // gray-600
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: 13,
  },
  labelStyle: { color: "#94a3b8" },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

function RealTimeRevenueAnalysis({ listOfCourses = [] }) {
  const { auth } = useContext(AuthContext);
  const { socket, connected } = useSocket();
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const formatINR = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

  const [realTimeData] = useState([]);
  const [analytics, setAnalytics]   = useState(null);
  const [liveStats, setLiveStats]    = useState({
    totalRevenue: 0, totalStudents: 0,
    todayRevenue: 0, todayStudents: 0,
    lastEnrollment: null, lastUpdated: null,
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!auth?.user?._id) return;

      if (auth?.user?.role === "admin") {
        const safe = Array.isArray(listOfCourses) ? listOfCourses : [];
        const totalRevenue  = safe.reduce((s, c) => s + (c.students?.length || 0) * (c.pricing || 0), 0);
        const totalStudents = safe.reduce((s, c) => s + (c.students?.length || 0), 0);
        setLiveStats({ totalRevenue, totalStudents, todayRevenue: totalRevenue, todayStudents: totalStudents, lastEnrollment: null, lastUpdated: new Date().toLocaleTimeString() });
        return;
      }

      try {
        const res = await fetchInstructorAnalyticsService(auth.user._id);
        if (isMounted && res?.success && res?.data) {
          setAnalytics(res.data);
          const today  = res.data?.dailyData?.[res.data.dailyData.length - 1];
          const totals = res.data?.totals || {};
          setLiveStats({
            totalRevenue:   Number(totals.totalRevenue   || 0),
            totalStudents:  Number(totals.totalStudents  || 0),
            todayRevenue:   Number(today?.revenue        || 0),
            todayStudents:  Number(today?.students       || 0),
            lastEnrollment: res.data?.lastEnrollment     || null,
            lastUpdated:    new Date().toLocaleTimeString(),
          });
        }
      } catch (err) { console.error("Error fetching analytics:", err); }
    }
    load();
    return () => { isMounted = false; };
  }, [auth?.user?._id, auth?.user?.role, listOfCourses]);

  useEffect(() => {
    if (!socket || !connected || !auth?.user?._id || auth?.user?.role === "admin") return;
    const handleUpdate = (data) => {
      if (data.instructorId !== auth.user._id) return;
      setLiveStats((prev) => ({
        ...prev,
        todayRevenue:   prev.todayRevenue   + Number(data.revenue || 0),
        todayStudents:  prev.todayStudents  + 1,
        totalRevenue:   prev.totalRevenue   + Number(data.revenue || 0),
        totalStudents:  prev.totalStudents  + 1,
        lastEnrollment: { studentName: data.studentName, courseTitle: data.courseTitle, revenue: data.revenue, timestamp: data.timestamp },
        lastUpdated:    new Date().toLocaleTimeString(),
      }));
      fetchInstructorAnalyticsService(auth.user._id)
        .then((r) => { if (r?.success) setAnalytics(r.data); })
        .catch(console.error);
    };
    socket.on("revenue-update", handleUpdate);
    return () => socket.off("revenue-update", handleUpdate);
  }, [socket, connected, auth?.user?._id, auth?.user?.role]);

  const revenueData = useMemo(() => {
    if (analytics?.totals) {
      const t = analytics.totals || {};
      return {
        totalRevenue:            Number(t.totalRevenue            || 0),
        totalStudents:           Number(t.totalStudents           || 0),
        averageRevenuePerStudent:Number(t.averageRevenuePerStudent|| 0),
        hourlyData:  analytics.hourlyData       || [],
        dailyData:   analytics.dailyData        || [],
        monthlyData: analytics.monthlyData      || [],
        coursePerformance: analytics.coursePerformance || [],
        categoryData:      analytics.categoryData      || [],
      };
    }

    const safe = Array.isArray(listOfCourses) ? listOfCourses : [];
    if (safe.length === 0) return { totalRevenue:0, totalStudents:0, averageRevenuePerStudent:0, hourlyData:[], dailyData:[], monthlyData:[], coursePerformance:[], categoryData:[] };

    const courseRevenue = safe.map((c) => ({
      id: c._id, title: c.title || "Untitled",
      students: c.students?.length || 0, price: c.pricing || 0,
      revenue:  (c.students?.length || 0) * (c.pricing || 0),
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      category: c.category || "General",
    }));

    const totalRevenue  = courseRevenue.reduce((s, c) => s + c.revenue,   0);
    const totalStudents = courseRevenue.reduce((s, c) => s + c.students,  0);
    const now = new Date();

    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (29 - i));
      return { day: d.toLocaleDateString("en-US",{month:"short",day:"numeric"}), revenue: i===29?totalRevenue:0, students: i===29?totalStudents:0 };
    });
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { month: d.toLocaleString("en-US",{month:"short"}), revenue: i===11?totalRevenue:0, students: i===11?totalStudents:0 };
    });
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now.getTime() - (23 - i) * 3600000);
      return { hour: `${String(d.getHours()).padStart(2,"0")}:00`, revenue: i===23?totalRevenue:0, students: i===23?totalStudents:0 };
    });

    return {
      totalRevenue, totalStudents,
      averageRevenuePerStudent: totalStudents > 0 ? totalRevenue / totalStudents : 0,
      hourlyData, dailyData, monthlyData,
      coursePerformance: courseRevenue.sort((a,b)=>b.revenue-a.revenue).slice(0,10),
      categoryData: [],
    };
  }, [analytics, listOfCourses]);

  const chartData = selectedPeriod === "hourly"
    ? revenueData.hourlyData
    : selectedPeriod === "monthly"
      ? revenueData.monthlyData
      : revenueData.dailyData;
  const xKey = selectedPeriod === "hourly" ? "hour" : selectedPeriod === "monthly" ? "month" : "day";
  const xLabel = selectedPeriod === "hourly" ? "Hour" : selectedPeriod === "monthly" ? "Month" : "Day";

  const kpiCards = [
    { title:"Total Revenue",       value:formatINR(revenueData.totalRevenue),              change:12.5, icon:IndianRupee, accent:"emerald", isLive:true,  liveValue:`+${formatINR(liveStats.todayRevenue)} today` },
    { title:"Total Students",      value:revenueData.totalStudents.toLocaleString(),        change:8.3,  icon:Users,       accent:"blue",    isLive:true,  liveValue:`+${liveStats.todayStudents} today` },
    { title:"Avg Revenue/Student", value:formatINR(revenueData.averageRevenuePerStudent),   change:5.2,  icon:Target,      accent:"purple" },
    { title:"Active Courses",      value:listOfCourses.length.toString(),                   change:12.5, icon:BookOpen,    accent:"orange" },
  ];

  const accentMap = {
    emerald:{ bg:"bg-emerald-500/10", text:"text-emerald-400", badge:"text-emerald-400" },
    blue:   { bg:"bg-blue-500/10",    text:"text-blue-400",    badge:"text-blue-400"    },
    purple: { bg:"bg-purple-500/10",  text:"text-purple-400",  badge:"text-purple-400"  },
    orange: { bg:"bg-orange-500/10",  text:"text-orange-400",  badge:"text-orange-400"  },
  };

  const darkCard = "border-white/5 bg-[#0f172a]/60 backdrop-blur";

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-3">
            Real-Time Revenue Analysis
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${connected ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live revenue tracking and student enrollment analytics
            {liveStats.lastUpdated && (
              <span className="ml-2 text-emerald-500 font-medium">• Updated {liveStats.lastUpdated}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
          >
            <option value="hourly">Last 24 Hours</option>
            <option value="daily">Last 30 Days</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Live Enrollment Banner */}
      {liveStats.lastEnrollment && (
        <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">New Enrollment: {liveStats.lastEnrollment.studentName}</p>
            <p className="text-xs text-gray-500">Enrolled in {liveStats.lastEnrollment.courseTitle} • +{formatINR(liveStats.lastEnrollment.revenue)}</p>
          </div>
          <p className="text-xs text-gray-600">
            {liveStats.lastEnrollment.timestamp ? new Date(liveStats.lastEnrollment.timestamp).toLocaleTimeString() : ""}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const a = accentMap[kpi.accent];
          return (
            <Card key={i} className={`${darkCard} hover:-translate-y-1 transition-all duration-300 hover:shadow-xl`}>
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${a.text}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {kpi.isLive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <Activity className="w-2.5 h-2.5" />LIVE
                      </span>
                    )}
                    <span className={`flex items-center gap-0.5 text-xs font-bold ${kpi.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {kpi.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(kpi.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="text-2xl font-black text-white mb-0.5">{kpi.value}</div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.title}</p>
                {kpi.liveValue && <p className="text-xs text-emerald-500 font-semibold mt-1">{kpi.liveValue}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="realtime" className="space-y-5">
        <TabsList className="grid w-full grid-cols-4 bg-[#0f172a]/80 border border-white/5 rounded-2xl p-1">
          {[
            { value:"realtime", icon:Activity,    label:"Live Data" },
            { value:"trends",   icon:TrendingUp,  label:"Trends"    },
            { value:"courses",  icon:BookOpen,    label:"Courses"   },
            { value:"activity", icon:Clock,       label:"Activity"  },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-gray-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-xs font-bold transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Live Data Tab */}
        <TabsContent value="realtime" className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card className={darkCard}>
              <CardHeader className="border-b border-white/5 px-5 py-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> Live Revenue Stream
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey={xKey} stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                    <YAxis stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v) => [formatINR(Number(v)), "Revenue"]}
                      labelFormatter={(l) => `${xLabel}: ${l}`}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className={darkCard}>
              <CardHeader className="border-b border-white/5 px-5 py-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Live Student Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey={xKey} stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                    <YAxis stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v) => [Number(v), "Students"]}
                      labelFormatter={(l) => `${xLabel}: ${l}`}
                    />
                    <Bar dataKey="students" fill="#10B981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-5">
          <Card className={darkCard}>
            <CardHeader className="border-b border-white/5 px-5 py-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Revenue vs Students Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={revenueData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="day" stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                  <YAxis yAxisId="left"  stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(v, name) => [name==="revenue"?formatINR(Number(v)):Number(v), name==="revenue"?"Revenue":"Students"]}
                    labelFormatter={(l) => `Day: ${l}`}
                  />
                  <Legend wrapperStyle={{ color:"#9CA3AF", fontSize:12 }} />
                  <Line yAxisId="left"  type="monotone" dataKey="revenue"  stroke="#3B82F6" strokeWidth={2.5} dot={false} name="Revenue (₹)" />
                  <Line yAxisId="right" type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2.5} dot={false} name="Students" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-5">
          <Card className={darkCard}>
            <CardHeader className="border-b border-white/5 px-5 py-4">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Top Performing Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {revenueData.coursePerformance.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={revenueData.coursePerformance.slice(0,5)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                      <XAxis type="number" stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                      <YAxis dataKey="title" type="category" width={130} stroke={AXIS_COLOR} tick={{ fill:"#6B7280", fontSize:11 }} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [formatINR(Number(v)), "Revenue"]} />
                      <Bar dataKey="revenue" fill="#8B5CF6" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {revenueData.coursePerformance.map((course, idx) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 font-black text-sm">{idx+1}</div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{course.title}</h4>
                            <p className="text-xs text-gray-500">{course.students} students • {formatINR(course.price)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-emerald-400 text-base">{formatINR(course.revenue)}</div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-14">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-400 font-semibold">No course data yet</p>
                  <p className="text-sm text-gray-600 mt-1">Create courses to see performance metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card className={darkCard}>
              <CardHeader className="border-b border-white/5 px-5 py-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {realTimeData.slice(0,10).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{event.studentName}</p>
                        <p className="text-xs text-gray-500 truncate">Enrolled in {event.courseTitle}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-emerald-400 text-sm">+{formatINR(event.revenue)}</p>
                        <p className="text-xs text-gray-600">{event.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {realTimeData.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-7 h-7 text-blue-400" />
                      </div>
                      <p className="text-gray-400 font-semibold text-sm">No recent activity</p>
                      <p className="text-xs text-gray-600 mt-1">Enrollments will appear here in real-time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={darkCard}>
              <CardHeader className="border-b border-white/5 px-5 py-4">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-7">
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-400 mb-1">{formatINR(liveStats.todayRevenue)}</div>
                  <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-400 mb-1">{liveStats.todayStudents}</div>
                  <p className="text-sm text-gray-500">Today&apos;s Enrollments</p>
                </div>
                <div className={`rounded-2xl p-4 ${connected ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-white/5 border border-white/10"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className={`w-4 h-4 ${connected ? "text-emerald-400" : "text-gray-600"}`} />
                    <span className={`font-bold text-sm ${connected ? "text-emerald-400" : "text-gray-500"}`}>
                      {connected ? "Live Updates Active" : "Live Updates Offline"}
                    </span>
                  </div>
                  <p className={`text-xs ${connected ? "text-emerald-600" : "text-gray-600"}`}>
                    {connected ? "Real-time updates via WebSocket connection." : "Reconnecting to live updates..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

RealTimeRevenueAnalysis.propTypes = { listOfCourses: PropTypes.array };

export default RealTimeRevenueAnalysis;
