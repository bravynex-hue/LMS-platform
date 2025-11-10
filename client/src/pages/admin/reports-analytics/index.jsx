import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign, Download } from "lucide-react";

function ReportsAnalyticsPage() {
  const [reportType, setReportType] = useState("student-progress");

  // Mock data - replace with actual API calls
  const studentProgressData = {
    totalStudents: 150,
    activeStudents: 120,
    completedCourses: 45,
    averageProgress: 68,
  };

  const internshipStats = {
    totalInternships: 25,
    activeInternships: 18,
    completedInternships: 7,
    totalApplicants: 89,
  };

  const revenueData = {
    totalRevenue: 12500,
    courseRevenue: 8500,
    internshipRevenue: 4000,
    monthlyGrowth: 12,
  };

  function handleExportReport() {
    // TODO: Implement export functionality
    alert("Export functionality coming soon");
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Monitor performance and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student-progress">Student Progress</SelectItem>
              <SelectItem value="internship-stats">Internship Stats</SelectItem>
              <SelectItem value="revenue">Revenue Reports</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Student Progress Report */}
      {reportType === "student-progress" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentProgressData.totalStudents}</div>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">All time</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentProgressData.activeStudents}</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Currently enrolled</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentProgressData.completedCourses}</div>
              <div className="flex items-center gap-1 mt-1">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-500">This month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentProgressData.averageProgress}%</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-500">Across all courses</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Internship Stats */}
      {reportType === "internship-stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Internships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internshipStats.totalInternships}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Internships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internshipStats.activeInternships}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internshipStats.completedInternships}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Applicants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internshipStats.totalApplicants}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Reports */}
      {reportType === "revenue" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueData.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">All time</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Course Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueData.courseRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Internship Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueData.internshipRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{revenueData.monthlyGrowth}%</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional detailed reports can be added here */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Detailed analytics and charts will be displayed here based on the selected report type.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsAnalyticsPage;

