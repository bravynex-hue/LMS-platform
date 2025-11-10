import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Edit, Trash2, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function InternshipManagementPage() {
  const { toast } = useToast();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInternships();
  }, []);

  async function loadInternships() {
    setLoading(true);
    // TODO: Replace with actual API call
    // const res = await fetchAllInternshipsService();
    // Mock data
    setTimeout(() => {
      setInternships([
        {
          _id: "1",
          title: "Full Stack Developer Internship",
          company: "Tech Corp",
          status: "pending",
          applicants: 15,
          postedDate: new Date("2024-01-10"),
        },
        {
          _id: "2",
          title: "Data Science Internship",
          company: "Data Analytics Inc",
          status: "approved",
          applicants: 8,
          postedDate: new Date("2024-01-05"),
        },
        {
          _id: "3",
          title: "UI/UX Designer Internship",
          company: "Design Studio",
          status: "rejected",
          applicants: 0,
          postedDate: new Date("2024-01-01"),
        },
      ]);
      setLoading(false);
    }, 500);
  }

  function handleApprove(internshipId) {
    // TODO: Implement API call
    toast({
      title: "Success",
      description: "Internship approved successfully",
    });
    loadInternships();
  }

  function handleReject(internshipId) {
    if (window.confirm("Are you sure you want to reject this internship?")) {
      // TODO: Implement API call
      toast({
        title: "Success",
        description: "Internship rejected",
      });
      loadInternships();
    }
  }

  function handleEdit(internshipId) {
    // TODO: Navigate to edit page or open dialog
    toast({
      title: "Info",
      description: "Edit functionality coming soon",
    });
  }

  function handleDelete(internshipId) {
    if (window.confirm("Are you sure you want to delete this internship?")) {
      // TODO: Implement API call
      toast({
        title: "Success",
        description: "Internship deleted successfully",
      });
      loadInternships();
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

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Approve or reject internships posted by companies
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Internships ({internships.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : internships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No internships found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.map((internship) => (
                    <TableRow key={internship._id}>
                      <TableCell className="font-medium">{internship.title}</TableCell>
                      <TableCell>{internship.company}</TableCell>
                      <TableCell>{getStatusBadge(internship.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{internship.applicants}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(internship.postedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {internship.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(internship._id)}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(internship._id)}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(internship._id)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(internship._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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

export default InternshipManagementPage;

