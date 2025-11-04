import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Shield } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/public/verify-certificate/${certificateId}`);
      
      if (response.data.success) {
        setVerification(response.data.data);
      } else {
        setError(response.data.message || "Certificate not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify certificate");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="text-gray-600">Verifying certificate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Certificate Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">{error}</p>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Certificate Verified</h1>
          <p className="text-gray-600">This certificate is authentic and has been verified</p>
        </div>

        {/* Verification Status */}
        <Card className="border-2 border-green-500 shadow-lg">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-900">Valid Certificate</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Certificate Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Student Name</p>
                <p className="text-lg font-semibold text-gray-900">{verification?.studentName}</p>
              </div>

              {verification?.studentId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Student ID</p>
                  <p className="text-lg font-mono font-semibold text-blue-600">{verification?.studentId}</p>
                </div>
              )}

              {verification?.studentFatherName && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Guardian Name</p>
                  <p className="text-lg font-semibold text-gray-900">{verification?.studentFatherName}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Course Title</p>
                <p className="text-lg font-semibold text-gray-900">{verification?.courseTitle}</p>
              </div>

              {verification?.grade && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Grade</p>
                  <p className="text-lg font-semibold text-gray-900">{verification?.grade}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Certificate ID</p>
                <p className="text-lg font-mono font-semibold text-purple-600">{verification?.certificateId}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(verification?.issueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Issued By</p>
                <p className="text-lg font-semibold text-gray-900">{verification?.issuedBy || "BRAVYNEX ENGINEERING"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center space-x-2">
                  {verification?.revoked ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <XCircle className="w-4 h-4 mr-1" />
                      Revoked
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Verification Note:</strong> This certificate has been verified against our database 
                  and confirmed to be authentic. The certificate was issued by BRAVYNEX ENGINEERING 
                  upon successful completion of the course requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate("/")} 
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-6">
          <p>© {new Date().getFullYear()} BRAVYNEX ENGINEERING. All rights reserved.</p>
          <p className="mt-1">Certificate verification powered by secure blockchain technology</p>
        </div>
      </div>
    </div>
  );
}
