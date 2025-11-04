import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import { fetchStudentAnalyticsService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, BookOpen, TrendingUp, Activity } from "lucide-react";
import {
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

function StudentAnalyticsPage() {
  const { auth } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    if (!auth?.user?._id) return;
    const res = await fetchStudentAnalyticsService(auth.user._id);
    if (res?.success) setAnalytics(res.data);
  }

  useEffect(() => {
    setLoading(true);
    loadAnalytics().finally(() => setLoading(false));
    const id = setInterval(loadAnalytics, 15000); // poll every 15s
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?._id]);

  const kpis = useMemo(() => {
    const totals = analytics?.totals || { totalSpent: 0, totalPurchases: 0, totalOwnedCourses: 0 };
    return [
      {
        icon: DollarSign,
        label: "Total Spent",
        value: `$${Number(totals.totalSpent || 0).toLocaleString()}`,
        bgColor: "bg-green-50",
        iconColor: "text-green-600"
      },
      {
        icon: Users,
        label: "Purchases",
        value: Number(totals.totalPurchases || 0).toString(),
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600"
      },
      {
        icon: BookOpen,
        label: "Owned Courses",
        value: Number(totals.totalOwnedCourses || 0).toString(),
        bgColor: "bg-orange-50",
        iconColor: "text-orange-600"
      },
      {
        icon: TrendingUp,
        label: "Avg Spend/Purchase",
        value: `$${((totals.totalSpent || 0) / Math.max(1, totals.totalPurchases || 0)).toFixed(2)}`,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600"
      }
    ];
  }, [analytics]);

  const monthlyData = useMemo(() => {
    return (analytics?.monthly || []).map((m) => ({
      label: m.label,
      revenue: m.revenue,
      purchases: m.purchases,
    }));
  }, [analytics]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Student Analytics
          <span className="inline-flex items-center gap-2 text-xs text-green-600 ml-2">
            <Activity className="w-3 h-3" /> LIVE
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((k, idx) => (
          <Card key={idx} className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-gray-600">{k.label}</CardTitle>
              <div className={`p-3 rounded-xl ${k.bgColor}`}>
                <k.icon className={`h-6 w-6 ${k.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="spend" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spend" className="flex items-center gap-2">Monthly Spend</TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">Monthly Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="spend" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle>Monthly Spend (Last 12 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Spent"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle>Monthly Purchases (Last 12 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v) => [Number(v), "Purchases"]} />
                  <Legend />
                  <Bar dataKey="purchases" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StudentAnalyticsPage;


