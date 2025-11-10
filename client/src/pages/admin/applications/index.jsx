import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setApplications([
        {
          _id: "1",
          studentName: "John Doe",
          studentEmail: "john@example.com",
          internshipTitle: "Full Stack Developer Internship",
          company: "Tech Corp",
          status: "pending",
          appliedDate: new Date("2024-01-15"),
        },
        {
          _id: "2",
          studentName: "Jane Smith",
          studentEmail: "jane@example.com",
          internshipTitle: "Data Science Internship",
          company: "Data Analytics Inc",
          status: "approved",
          appliedDate: new Date("2024-01-12"),
        },
        {
          _id: "3",
          studentName: "Bob Johnson",
          studentEmail: "bob@example.com",
          internshipTitle: "UI/UX Designer Internship",
          company: "Design Studio",
          status: "rejected",
          appliedDate: new Date("2024-01-10"),
        },
      ]);
      setLoading(false);
    }, 500);
  }

  function handleApprove(applicationId) {
    // TODO: Implement API call
    toast({
      title: "Success",
      description: "Application approved",
    });
    loadApplications();
  }

  function handleReject(applicationId) {
    if (window.confirm("Are you sure you want to reject this application?")) {
      // TODO: Implement API call
      toast({
        title: "Success",
        description: "Application rejected",
      });
      loadApplications();
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.internshipTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesCompany = companyFilter === "all" || app.company === companyFilter;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const uniqueCompanies = [...new Set(applications.map((app) => app.company))];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Track student internship applications
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by student, email, or internship..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {uniqueCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No applications found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Internship</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell className="font-medium">{app.studentName}</TableCell>
                      <TableCell>{app.studentEmail}</TableCell>
                      <TableCell>{app.internshipTitle}</TableCell>
                      <TableCell>{app.company}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(app._id)}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(app._id)}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
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

export default ApplicationsPage;

