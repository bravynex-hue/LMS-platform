import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
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
  Activity
} from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
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
  ResponsiveContainer
} from "recharts";

function RealTimeRevenueAnalysis({ listOfCourses = [] }) {
  const { auth } = useContext(AuthContext);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [realTimeData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [liveStats, setLiveStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    todayRevenue: 0,
    todayStudents: 0,
    lastEnrollment: null,
    lastUpdated: null
  });

  // Load instructor analytics - fetch once on mount, no polling
  useEffect(() => {
    let isMounted = true;
    
    async function load() {
      if (!auth?.user?._id) return;
      
      try {
        console.log("Fetching instructor analytics...");
        const res = await fetchInstructorAnalyticsService(auth.user._id);
        
        if (isMounted && res?.success) {
          console.log("Received analytics data");
          setAnalytics(res.data);
          
          // Derive today's stats from dailyData last item if available
          const today = res.data?.dailyData?.[res.data.dailyData.length - 1];
          const totals = res.data?.totals || {};
          
          setLiveStats({
            totalRevenue: Number(totals.totalRevenue || 0),
            totalStudents: Number(totals.totalStudents || 0),
            todayRevenue: Number(today?.revenue || 0),
            todayStudents: Number(today?.students || 0),
            lastEnrollment: res.data?.lastEnrollment || null,
            lastUpdated: new Date().toLocaleTimeString(),
          });
        } else if (res && !res.success) {
          console.error("Failed to fetch analytics:", res.message);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    
    // Initial load only
    load();
    
    return () => { 
      isMounted = false;
    };
  }, [auth?.user?._id]);

  // Add a log for analytics state after it's updated
  useEffect(() => {
    console.log("Analytics state updated:", analytics); // Log 3
  }, [analytics]);

  // Calculate revenue data
  const revenueData = useMemo(() => {
    if (analytics) {
      const totals = analytics.totals || {};
      return {
        totalRevenue: Number(totals.totalRevenue || 0),
        totalStudents: Number(totals.totalStudents || 0),
        averageRevenuePerStudent: Number(totals.averageRevenuePerStudent || 0),
        hourlyData: analytics.hourlyData || [],
        dailyData: analytics.dailyData || [],
        monthlyData: analytics.monthlyData || [],
        coursePerformance: analytics.coursePerformance || [],
        categoryData: analytics.categoryData || [],
      };
    }
    // Fallback to course-derived summary until analytics loads
    const safeCourses = Array.isArray(listOfCourses) ? listOfCourses : [];
    const courseRevenue = safeCourses.map(course => ({
      id: course._id || `course-${Math.random()}`,
      title: course.title || "Untitled Course",
      students: course.students?.length || 0,
      price: course.pricing || 0,
      revenue: (course.students?.length || 0) * (course.pricing || 0),
      createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
      category: course.category || "General"
    }));
    const totalRevenue = courseRevenue.reduce((sum, c) => sum + c.revenue, 0);
    const totalStudents = courseRevenue.reduce((sum, c) => sum + c.students, 0);
    const averageRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;
    return {
      totalRevenue,
      totalStudents,
      averageRevenuePerStudent,
      hourlyData: [],
      dailyData: [],
      monthlyData: [],
      coursePerformance: courseRevenue.sort((a,b) => b.revenue - a.revenue).slice(0,10),
      categoryData: [],
    };
  }, [analytics, listOfCourses]);

  // KPI Cards with real-time indicators
  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${revenueData.totalRevenue.toLocaleString()}`,
      change: 12.5,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      isLive: true,
      liveValue: `+$${liveStats.todayRevenue} today`
    },
    {
      title: "Total Students",
      value: revenueData.totalStudents.toLocaleString(),
      change: 8.3,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      isLive: true,
      liveValue: `+${liveStats.todayStudents} today`
    },
    {
      title: "Avg Revenue/Student",
      value: `$${revenueData.averageRevenuePerStudent.toFixed(2)}`,
      change: 5.2,
      icon: Target,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Active Courses",
      value: listOfCourses.length.toString(),
      change: 12.5,
      icon: BookOpen,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  // Chart colors
  // const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Real-Time Revenue Analysis
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-normal text-green-600">LIVE</span>
            </div>
          </h1>
          <p className="text-gray-600 mt-2">
            Live revenue tracking and student enrollment analytics
            {liveStats.lastUpdated && (
              <span className="ml-2 text-sm text-green-600">
                • Last updated: {liveStats.lastUpdated}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hourly">Last 24 Hours</option>
            <option value="daily">Last 30 Days</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Live Activity Feed */}
      {liveStats.lastEnrollment && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  New Enrollment: {liveStats.lastEnrollment.studentName}
                </p>
                <p className="text-sm text-gray-600">
                  Enrolled in {liveStats.lastEnrollment.courseTitle} • +${liveStats.lastEnrollment.revenue}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {liveStats.lastEnrollment.timestamp ? new Date(liveStats.lastEnrollment.timestamp).toLocaleTimeString() : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
                <div className="flex items-center gap-2">
                  {kpi.isLive && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <Activity className="w-3 h-3" />
                      LIVE
                    </div>
                  )}
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    kpi.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
              {kpi.liveValue && (
                <p className="text-xs text-green-600 font-medium">{kpi.liveValue}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Data
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Real-time Revenue Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Live Revenue Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={selectedPeriod === 'hourly' ? revenueData.hourlyData : (selectedPeriod === 'monthly' ? revenueData.monthlyData : revenueData.dailyData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedPeriod === 'hourly' ? 'hour' : (selectedPeriod === 'monthly' ? 'month' : 'day')} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `${selectedPeriod === 'hourly' ? 'Hour' : (selectedPeriod === 'monthly' ? 'Month' : 'Day')}: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Live Student Enrollments */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Live Student Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedPeriod === 'hourly' ? revenueData.hourlyData : (selectedPeriod === 'monthly' ? revenueData.monthlyData : revenueData.dailyData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedPeriod === 'hourly' ? 'hour' : (selectedPeriod === 'monthly' ? 'month' : 'day')} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [Number(value), 'Students']}
                      labelFormatter={(label) => `${selectedPeriod === 'hourly' ? 'Hour' : (selectedPeriod === 'monthly' ? 'Month' : 'Day')}: ${label}`}
                    />
                    <Bar dataKey="students" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Revenue vs Students Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, seriesName) => [
                      seriesName === 'revenue' ? `$${Number(value).toLocaleString()}` : Number(value),
                      seriesName === 'revenue' ? 'Revenue' : 'Students'
                    ]}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Top Performing Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.coursePerformance && revenueData.coursePerformance.length > 0 ? (
                  <>
                    <div className="mb-6">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData.coursePerformance.slice(0, 5)} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="title" type="category" width={120} />
                          <Tooltip 
                            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label) => `Course: ${label}`}
                          />
                          <Bar dataKey="revenue" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {revenueData.coursePerformance.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-600">{course.students} students • ${course.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${course.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No course performance data available</p>
                    <p className="text-sm">Create courses to see performance metrics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {realTimeData.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{event.studentName}</p>
                        <p className="text-sm text-gray-600">Enrolled in {event.courseTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+${event.revenue}</p>
                        <p className="text-xs text-gray-500">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realTimeData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent activity</p>
                      <p className="text-sm">Enrollments will appear here in real-time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Stats */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${liveStats.todayRevenue.toLocaleString()}
                    </div>
                    <p className="text-gray-600">Today&apos;s Revenue</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {liveStats.todayStudents}
                    </div>
                    <p className="text-gray-600">Today&apos;s Enrollments</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-800">Live Updates</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Data updates every 15 seconds from live analytics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

RealTimeRevenueAnalysis.propTypes = {
  listOfCourses: PropTypes.array,
};

export default RealTimeRevenueAnalysis;
