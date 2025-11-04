import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Users,
  BookOpen,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { fetchInstructorAnalyticsService } from "@/services";

function RevenueAnalysis({ listOfCourses = [] }) {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const { auth } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!auth?.user?._id) return;
      const res = await fetchInstructorAnalyticsService(auth.user._id);
      if (mounted && res?.success) setAnalytics(res.data);
    }
    load();
    const id = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, [auth?.user?._id]);

  const revenueData = useMemo(() => {
    if (analytics) {
      const totals = analytics.totals || {};
      const categoryRevenue = (analytics.categoryData || []).reduce((acc, item) => {
        acc[item.name] = { revenue: item.value, students: item.students || 0, courses: item.courses || 0 };
        return acc;
      }, {});
      return {
        totalRevenue: Number(totals.totalRevenue || 0),
        totalStudents: Number(totals.totalStudents || 0),
        averageRevenuePerStudent: Number(totals.averageRevenuePerStudent || 0),
        courseRevenue: analytics.coursePerformance?.slice(0, 5) || [],
        monthlyData: analytics.monthlyData || [],
        coursePerformance: analytics.coursePerformance?.slice(0, 5) || [],
        categoryRevenue,
      };
    }
    // fallback
    return {
      totalRevenue: 0,
      totalStudents: 0,
      averageRevenuePerStudent: 0,
      courseRevenue: [],
      monthlyData: [],
      coursePerformance: [],
      categoryRevenue: {},
    };
  }, [analytics]);

  // Calculate growth rates
  const currentMonthRevenue = revenueData.monthlyData?.[revenueData.monthlyData.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenueData.monthlyData?.[revenueData.monthlyData.length - 2]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  const currentMonthStudents = revenueData.monthlyData?.[revenueData.monthlyData.length - 1]?.students || 0;
  const previousMonthStudents = revenueData.monthlyData?.[revenueData.monthlyData.length - 2]?.students || 0;
  const studentGrowth = previousMonthStudents > 0 
    ? ((currentMonthStudents - previousMonthStudents) / previousMonthStudents) * 100 
    : 0;

  // KPI Cards
  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${revenueData.totalRevenue.toLocaleString()}`,
      change: revenueGrowth,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Total Students",
      value: revenueData.totalStudents.toLocaleString(),
      change: studentGrowth,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
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

  // Simple Bar Chart Component
  // PropTypes: data (array), title (string), color (string, optional)
  // eslint-disable-next-line react/prop-types
  const BarChart = ({ data, title, color = "blue" }) => {
    // Add null/undefined checks and fallback data
    const safeData = Array.isArray(data) ? data : [];
    
    // If no data, show a message
    if (safeData.length === 0) {
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p>No data available</p>
            <p className="text-sm">Data will appear here once courses are created</p>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...safeData.map(d => d.revenue || 0));
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <div className="space-y-3">
          {safeData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
                <span className="text-sm font-bold text-gray-900">${(item.revenue || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full bg-gradient-to-r ${
                    color === "blue" ? "from-blue-500 to-blue-600" : 
                    color === "green" ? "from-green-500 to-green-600" :
                    "from-purple-500 to-purple-600"
                  }`}
                  style={{ width: `${maxValue > 0 ? ((item.revenue || 0) / maxValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple Pie Chart Component
  // PropTypes: data (object), title (string)
  // eslint-disable-next-line react/prop-types
  const PieChart = ({ data, title }) => {
    // Add null/undefined checks and fallback data
    const safeData = data && typeof data === 'object' ? data : {};
    const dataEntries = Object.entries(safeData);
    
    // If no data, show a message
    if (dataEntries.length === 0) {
      return (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <p>No category data available</p>
            <p className="text-sm">Create courses with categories to see revenue breakdown</p>
          </div>
        </div>
      );
    }

    const total = dataEntries.reduce((sum, [, item]) => sum + (item?.revenue || 0), 0);
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600", 
      "from-purple-500 to-purple-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600"
    ];

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <div className="space-y-3">
          {dataEntries.map(([category, item], index) => {
            const revenue = item?.revenue || 0;
            const percentage = total > 0 ? (revenue / total) * 100 : 0;
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">${revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Add error boundary
  try {
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analysis</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your course revenue and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
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
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <p className="text-sm text-gray-600">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Revenue Trend
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Performance
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            By Category
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Student Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={revenueData.monthlyData} title="Revenue by Month" color="blue" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Student Enrollment Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={revenueData.monthlyData.map(d => ({ month: d.month, revenue: d.students }))} 
                  title="Students by Month" 
                  color="green" 
                />
              </CardContent>
            </Card>
          </div>
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
                  revenueData.coursePerformance.map((course, index) => (
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
                  ))
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

        <TabsContent value="categories" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-600" />
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={revenueData.categoryRevenue} title="Revenue Distribution" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Student Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {studentGrowth >= 0 ? '+' : ''}{studentGrowth.toFixed(1)}%
                  </div>
                  <p className="text-gray-600">Month over Month Growth</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {studentGrowth >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      studentGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {studentGrowth >= 0 ? 'Growing' : 'Declining'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Revenue per Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ${revenueData.averageRevenuePerStudent.toFixed(2)}
                  </div>
                  <p className="text-gray-600">Average Revenue per Student</p>
                  <div className="mt-4 bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      This metric helps you understand the value each student brings to your business.
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
  } catch (error) {
    console.error("RevenueAnalysis Error:", error);
    return (
      <div className="p-6 space-y-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Revenue Analysis Error</h2>
          <p className="text-gray-600 mb-4">There was an error loading the revenue analysis.</p>
          <p className="text-sm text-gray-500">Please try refreshing the page or contact support if the issue persists.</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-mono text-gray-700">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
}

RevenueAnalysis.propTypes = {
  listOfCourses: PropTypes.array,
};

export default RevenueAnalysis;
