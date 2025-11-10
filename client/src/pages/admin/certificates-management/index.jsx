import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Download, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllCertificateRequestsService,
  approveCertificateRequestService,
  rejectCertificateRequestService,
  adminRevokeCertificateService,
  downloadCertificatePDFService,
} from "@/services";

function CertificatesManagementPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    loadCertificates();
  }, [statusFilter]);

  async function loadCertificates() {
    setLoading(true);
    try {
      const res = await getAllCertificateRequestsService(statusFilter === "all" ? null : statusFilter);
      if (res?.success) {
        setCertificates(res.data || []);
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load certificates",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load certificates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(certificateId) {
    try {
      const res = await approveCertificateRequestService(certificateId, {});
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Certificate approved and generated successfully",
        });
        loadCertificates();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to approve certificate",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving certificate:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to approve certificate",
        variant: "destructive",
      });
    }
  }

  async function handleReject(certificateId) {
    if (window.confirm("Are you sure you want to reject this certificate request?")) {
      try {
        const res = await rejectCertificateRequestService(certificateId, { reason: "Rejected by admin" });
        if (res?.success) {
          toast({
            title: "Success",
            description: res.message || "Certificate request rejected",
          });
          loadCertificates();
        } else {
          toast({
            title: "Error",
            description: res?.message || "Failed to reject certificate",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error rejecting certificate:", error);
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to reject certificate",
          variant: "destructive",
        });
      }
    }
  }

  function handleViewCertificate(certificateId) {
    // TODO: Open certificate preview/download
    toast({
      title: "Info",
      description: "Certificate preview coming soon",
    });
  }

  async function handleDownloadCertificate(certificateId) {
    try {
      const res = await downloadCertificatePDFService(certificateId);
      if (res?.success) {
        toast({
          title: "Info",
          description: res.message || "Certificate download coming soon",
        });
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to download certificate",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to download certificate",
        variant: "destructive",
      });
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Verification
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  }

  const filteredCertificates = statusFilter === "all"
    ? certificates
    : certificates.filter((c) => c.status === statusFilter);

  const pendingCount = certificates.filter((c) => c.status === "pending").length;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Certificates Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Approve or generate internship completion certificates
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-100 text-yellow-700 text-base px-3 py-1">
            {pendingCount} Pending Verification
          </Badge>
        )}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Verification</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No certificates found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Course/Internship</TableHead>
                    <TableHead>Instructor Approved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((certificate) => (
                    <TableRow key={certificate._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{certificate.studentName}</div>
                          <div className="text-sm text-gray-500">{certificate.studentEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {certificate.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {certificate.courseName || certificate.internshipName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {certificate.instructorApproved ? (
                          <Badge className="bg-green-100 text-green-700">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                      <TableCell>
                        {new Date(certificate.requestedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {certificate.status === "approved" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCertificate(certificate._id)}
                                title="View Certificate"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadCertificate(certificate._id)}
                                title="Download Certificate"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {certificate.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(certificate._id)}
                                title="Approve & Generate"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(certificate._id)}
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

export default CertificatesManagementPage;

