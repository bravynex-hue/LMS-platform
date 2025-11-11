import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, IndianRupee, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllTransactionsService, exportTransactionsReportService } from "@/services";

function PaymentsTransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Helper function to format currency in INR
  const formatINR = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTransactions() {
    setLoading(true);
    try {
      const res = await getAllTransactionsService();
      if (res?.success) {
        setTransactions(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load transactions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleExportReport() {
    try {
      const res = await exportTransactionsReportService();
      if (res?.success && res.data) {
        // Convert to CSV
        const headers = ["Student Name", "Student Email", "Type", "Item", "Amount", "Status", "Date", "Payment Method"];
        const csvRows = [
          headers.join(","),
          ...res.data.map((transaction) => {
            return [
              `"${transaction.studentName || ""}"`,
              `"${transaction.studentEmail || ""}"`,
              `"${transaction.type || ""}"`,
              `"${transaction.itemName || ""}"`,
              transaction.amount || 0,
              `"${transaction.status || ""}"`,
              `"${new Date(transaction.date).toLocaleDateString()}"`,
              `"${transaction.paymentMethod || ""}"`,
            ].join(",");
          }),
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", res.filename || `transactions-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Success",
          description: "Report exported successfully",
        });
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to export report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to export report",
        variant: "destructive",
      });
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.itemName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalRevenue = summary.totalRevenue || transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View all transactions and export payment reports
          </p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <IndianRupee className="w-5 h-5 text-green-500" />
              {formatINR(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions || transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.completedTransactions || transactions.filter((t) => t.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="course">Course Purchase</SelectItem>
                <SelectItem value="internship">Internship Enrollment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.studentName}</div>
                          <div className="text-sm text-gray-500">{transaction.studentEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.itemName}</TableCell>
                      <TableCell className="font-medium">
                        {formatINR(transaction.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentsTransactionsPage;

