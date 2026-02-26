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
    toast({
      title: "Info",
      description: "Certificate preview feature coming soon",
    });
  }

  async function handleDownloadCertificate(certificateId) {
    try {
      const res = await downloadCertificatePDFService(certificateId);
      if (res?.success) {
        toast({
          title: "Success",
          description: "Certificate downloaded successfully",
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
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 flex items-center gap-1.5 font-bold uppercase tracking-tighter text-[10px]">
            <CheckCircle className="w-3 h-3" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1 flex items-center gap-1.5 font-bold uppercase tracking-tighter text-[10px]">
            <XCircle className="w-3 h-3" />
            Denied
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 flex items-center gap-1.5 font-bold uppercase tracking-tighter text-[10px]">
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      default:
        return <Badge className="bg-white/5 text-gray-400 border-white/10 uppercase tracking-tighter text-[10px]">{status}</Badge>;
    }
  }

  const filteredCertificates = statusFilter === "all"
    ? certificates
    : certificates.filter((c) => c.status === statusFilter);

  const pendingCount = certificates.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
             <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Certificates <span className="text-blue-500 font-black">Nexus</span></h1>
          </div>
          <p className="text-gray-500 font-medium text-sm ml-4">Authenticate and finalize architectural engineering credentials.</p>
        </div>
        
        {pendingCount > 0 && (
          <div className="bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] rounded-2xl px-5 py-4 flex items-center gap-4 border border-blue-400/30">
             <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white animate-pulse" />
             </div>
             <div>
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest leading-none">Awaiting Review</p>
                <p className="text-xl font-black text-white">{pendingCount} Applications</p>
             </div>
          </div>
        )}
      </div>

      {/* Control Layer */}
      <Card className="border-white/5 bg-[#0f172a]/40 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-6">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <Download className="w-5 h-5 text-gray-400" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Verification Pipeline</h3>
                    <p className="text-xs text-gray-500">Process student completion records</p>
                 </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[240px] bg-white/5 border-white/10 rounded-xl h-12 text-white font-bold focus:ring-blue-500/50">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                  <SelectItem value="all" className="focus:bg-white/5 cursor-pointer">Global System Filter</SelectItem>
                  <SelectItem value="pending" className="focus:bg-white/5 cursor-pointer">Pending Verifications</SelectItem>
                  <SelectItem value="approved" className="focus:bg-white/5 cursor-pointer">Successfully Issued</SelectItem>
                  <SelectItem value="rejected" className="focus:bg-white/5 cursor-pointer">Denied Records</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </CardContent>
      </Card>

      {/* Main Data Layer */}
      <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-white/5 px-8 py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Certificate Registry <span className="text-gray-600">({filteredCertificates.length})</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Syncing Secure Vault...</p>
             </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Eye className="w-8 h-8 text-gray-700" />
               </div>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No records found matching criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="px-8 font-black text-gray-500 text-[10px] uppercase tracking-[0.2em]">Student Node</TableHead>
                    <TableHead className="font-black text-gray-500 text-[10px] uppercase tracking-[0.2em]">Credential</TableHead>
                    <TableHead className="font-black text-gray-500 text-[10px] uppercase tracking-[0.2em]">Program Title</TableHead>
                    <TableHead className="font-black text-gray-500 text-[10px] uppercase tracking-[0.2em]">Verification</TableHead>
                    <TableHead className="font-black text-gray-500 text-[10px] uppercase tracking-[0.2em]">System Status</TableHead>
                    <TableHead className="pr-8 font-black text-gray-500 text-[10px] uppercase tracking-[0.2em] text-right">Administrative Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((certificate) => (
                    <TableRow key={certificate._id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="px-8 py-5">
                        <div>
                          <p className="font-black text-white group-hover:text-blue-400 transition-colors">{certificate.studentName}</p>
                          <p className="text-xs text-gray-500 font-medium">{certificate.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                          {certificate.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-white font-bold text-sm max-w-[200px] truncate">
                           {certificate.courseName || certificate.internshipName || "SECURE_NODE"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {certificate.instructorApproved ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-tighter">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                             Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-tighter">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                             Unverified
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex gap-2 justify-end">
                          {certificate.status === "approved" && (
                            <>
                              <button
                                onClick={() => handleViewCertificate(certificate._id)}
                                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg"
                                title="Visualize Certificate"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadCertificate(certificate._id)}
                                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-lg"
                                title="Download Vector PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {certificate.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(certificate._id)}
                                className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                title="Finalize Credential"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(certificate._id)}
                                className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                title="Deny Application"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
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

