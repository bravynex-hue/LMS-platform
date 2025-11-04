import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Users,
  BookOpen,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useContext } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { AuthContext } from "@/context/auth-context";
import { fetchInstructorAnalyticsService } from "@/services";

function ChartRevenueAnalysis({ listOfCourses = [] }) {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const { auth } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!auth?.user?._id) return;
      const res = await fetchInstructorAnalyticsService(auth.user._id);
      if (active && res?.success) setAnalytics(res.data);
    }
    load();
    const id = setInterval(load, 5000);
    return () => { active = false; clearInterval(id); };
  }, [auth?.user?._id]);

  // Calculate revenue data
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
        courseRevenue: analytics.coursePerformance || [],
        monthlyData: analytics.monthlyData || [],
        coursePerformance: analytics.coursePerformance || [],
        categoryData: analytics.categoryData || [],
        categoryRevenue,
      };
    }

    // Fallback to current listOfCourses until analytics loads
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
    const totalRevenue = courseRevenue.reduce((sum, course) => sum + course.revenue, 0);
    const totalStudents = courseRevenue.reduce((sum, course) => sum + course.students, 0);
    const averageRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;

    return {
      totalRevenue,
      totalStudents,
      averageRevenuePerStudent,
      courseRevenue,
      monthlyData: [],
      coursePerformance: courseRevenue.sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      categoryData: [],
      categoryRevenue: {},
    };
  }, [analytics, listOfCourses]);
  

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

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

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
            {/* Revenue Trend Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Students']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Enrollment Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Student Enrollment Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [Number(value), name === 'students' ? 'Students' : 'Courses']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="students" fill="#10B981" name="Students" />
                    <Bar dataKey="courses" fill="#8B5CF6" name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Combined Revenue & Students Chart */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Revenue vs Students Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${Number(value).toLocaleString()}` : Number(value),
                      name === 'revenue' ? 'Revenue' : 'Students'
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
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
                    {/* Course Performance Chart */}
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
                    
                    {/* Course List */}
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

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-orange-600" />
                  Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData.categoryData && revenueData.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={revenueData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PieChart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No category data available</p>
                    <p className="text-sm">Create courses with categories to see breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Bar Chart */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData.categoryData && revenueData.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData.categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No category data available</p>
                    <p className="text-sm">Create courses with categories to see breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Student Growth Rate */}
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

            {/* Revenue per Student */}
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

          {/* Student Growth Chart */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Student Growth Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [Number(value), name === 'students' ? 'Students' : 'Courses']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Students"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="courses" 
                    stackId="2"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6}
                    name="Courses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

ChartRevenueAnalysis.propTypes = {
  listOfCourses: PropTypes.array,
};

export default ChartRevenueAnalysis;
