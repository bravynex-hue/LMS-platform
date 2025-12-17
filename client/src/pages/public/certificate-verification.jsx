import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Fingerprint,
  Loader2,
  Mail,
  Shield,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

export default function CertificateVerificationPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certificateId) return;

    let isMounted = true;

    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/public/verify-certificate/${certificateId}`);

        if (!isMounted) return;
        if (response.data.success) {
          setVerification(response.data.data);
        } else {
          setError(response.data.message || "Certificate not found");
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to verify certificate");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVerification();

    return () => {
      isMounted = false;
    };
  }, [certificateId]);

  const issueDate = verification?.issueDate || verification?.approvedAt || verification?.createdAt;

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,96,255,0.18),transparent_45%),_radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),transparent_45%)]" />
        <div className="relative z-10 w-full max-w-md px-6">
          <Card className="bg-slate-900/85 border-slate-800 shadow-2xl backdrop-blur">
            <CardContent className="py-10 flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-400" />
                </span>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-white">Verifying certificate</p>
                <p className="text-sm text-slate-300">
                  Securing a trusted connection with the accreditation ledger…
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.12),transparent_35%)]" />
        <div className="relative z-10 w-full max-w-lg">
          <Card className="bg-slate-900/90 border border-red-400/30 shadow-2xl backdrop-blur">
            <CardHeader className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-3xl text-white">Certificate not found</CardTitle>
                <p className="text-slate-300 mt-2">
                  We couldn’t match the provided ID in our verification registry.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4 text-sm text-slate-200">
                <p>
                  Please confirm the certificate ID exactly as printed on the document. If you believe
                  this is an error, contact our credentialing desk for a manual review.
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),transparent_45%)]" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 space-y-8">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3 bg-slate-900/80 border-slate-800 backdrop-blur shadow-2xl">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Verification</p>
                  <CardTitle className="text-3xl text-white mt-1">Certificate verified</CardTitle>
                </div>
              </div>
              <p className="text-slate-300">
                This credential has been validated against our secure registry and confirmed as an
                official issuance from BRAVYNEX Engineering.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatusTile
                  icon={ShieldCheck}
                  label="Status"
                  value={verification?.revoked ? "Revoked" : "Active & authentic"}
                  accent={verification?.revoked ? "text-red-400" : "text-emerald-400"}
                />
                <StatusTile
                  icon={Award}
                  label="Certificate ID"
                  value={verification?.certificateId}
                  accent="text-violet-300"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoTile
                  icon={User}
                  label="Student"
                  value={verification?.studentName}
                  highlight={verification?.studentId ? `ID • ${verification.studentId}` : null}
                />
                <InfoTile
                  icon={BookOpen}
                  label="Course"
                  value={verification?.courseTitle}
                  highlight={verification?.grade ? `Grade • ${verification.grade}` : null}
                />
                {verification?.studentFatherName && (
                  <InfoTile
                    icon={User}
                    label="Guardian"
                    value={verification.studentFatherName}
                  />
                )}
                {verification?.studentEmail && (
                  <InfoTile icon={Mail} label="Email" value={verification.studentEmail} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Certification metadata</CardTitle>
              <p className="text-sm text-slate-400">
                Timestamped details captured at the moment of issuance.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <MetaRow
                icon={Fingerprint}
                label="Custom student ID"
                value={verification?.customStudentId || verification?.studentId || "Not assigned"}
              />
              <MetaRow
                icon={CalendarDays}
                label="Issued on"
                value={
                  issueDate
                    ? new Date(issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Date unavailable"
                }
              />
              <MetaRow
                icon={Shield}
                label="Issued by"
                value={verification?.issuedBy || "BRAVYNEX ENGINEERING"}
              />
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">Verification note:</strong> All certificate IDs are
                  validated in real time against our safeguarded issuance ledger. Any tampering or
                  duplication attempts trigger immediate compliance alerts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-400">
            <p>© {new Date().getFullYear()} BRAVYNEX ENGINEERING. All rights reserved.</p>
            <p className="mt-1 text-slate-500">
              Certificate verification powered by multi-layer cryptographic audits.
            </p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-slate-900/60">
      <div className="flex items-center gap-3">
        <Icon className={`w-10 h-10 ${accent || "text-white"}`} />
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon className="w-4 h-4 text-slate-300" />
        <span>{label}</span>
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
      {highlight && <p className="text-sm text-slate-400">{highlight}</p>}
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border border-white/5 rounded-lg p-3 bg-slate-900/40">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-200" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

StatusTile.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  accent: PropTypes.string,
};

InfoTile.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  highlight: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

MetaRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};
