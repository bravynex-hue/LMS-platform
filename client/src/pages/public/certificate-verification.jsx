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
  Zap,
  ChevronRight,
  ExternalLink
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
      <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
        <div className="relative z-10 w-full max-w-md">
          <Card className="glass-card border-white/10 bg-white/[0.02]">
            <CardContent className="py-16 flex flex-col items-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-400" />
                </span>
                <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Verifying Credentials</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Establishing secure nexus with accreditation ledger...
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
      <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
        <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 duration-500">
          <Card className="glass-card border-red-500/20 bg-red-500/[0.02]">
            <CardHeader className="flex flex-col items-center text-center space-y-4 pt-8 sm:pt-12 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
              </div>
              <div className="space-y-2 text-center">
                <CardTitle className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Signal Lost</CardTitle>
                <p className="text-red-400/70 font-black uppercase text-[10px] tracking-widest leading-relaxed px-4">
                   Credential Identifier not found in active registry.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8">
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 sm:p-5">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 leading-relaxed italic text-center">
                  "Please confirm the certificate ID exactly as printed. If the issue persists, 
                  contact the administrative attache for manual verification."
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-white text-black hover:bg-gray-200 h-12 sm:h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                Abort & Return
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden" style={{ background: "var(--bg-dark)" }}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
      </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8 sm:space-y-12 animate-in fade-in duration-1000">
        {/* Verification Hero Card */}
        <div className="grid gap-6 sm:gap-10 lg:grid-cols-5">
          <Card className="lg:col-span-3 glass-card border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <CardHeader className="p-6 sm:p-10 flex flex-col gap-5 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                     <Zap className="w-2.5 h-2.5" />
                     <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] leading-none">Security Verified</span>
                  </div>
                  <CardTitle className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-[1.1]">Protocol Confirmed</CardTitle>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed max-w-2xl text-center sm:text-left">
                This academic credential has been successfully validated against the secure ledgers of 
                <span className="text-white font-black italic"> BRAVYNEX Engineering</span>.
              </p>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 pt-0 space-y-6 sm:space-y-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatusTile
                  icon={ShieldCheck}
                  label="Network Status"
                  value={verification?.revoked ? "REVOKED" : "ACTIVE / AUTHENTIC"}
                  accent={verification?.revoked ? "text-red-500" : "text-emerald-400"}
                />
                <StatusTile
                  icon={Award}
                  label="Credential ID"
                  value={verification?.certificateId}
                  accent="text-blue-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-6 border-t border-white/5">
                <InfoTile
                  icon={User}
                  label="Student Record"
                  value={verification?.studentName}
                  highlight={verification?.studentId ? `NODE_REF: ${verification.studentId}` : null}
                />
                <InfoTile
                  icon={BookOpen}
                  label="Track Domain"
                  value={verification?.courseTitle}
                  highlight={verification?.grade ? `Performance Index: ${verification.grade}` : null}
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadata Sidebar */}
          <Card className="lg:col-span-2 glass-card border-white/5 bg-white/[0.01]">
            <CardHeader className="p-6 sm:p-8 border-b border-white/5">
              <CardTitle className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-3">
                 <Fingerprint className="w-4 h-4 text-purple-400" />
                 Metadata Archive
              </CardTitle>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-2">
                Immutable record logs since issuance.
              </p>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-4 sm:space-y-6">
              <MetaRow
                icon={Fingerprint}
                label="Student ID Ref"
                value={verification?.customStudentId || verification?.studentId || "UNASSIGNED"}
              />
              <MetaRow
                icon={CalendarDays}
                label="Timestamp"
                value={
                  issueDate
                    ? new Date(issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "UNKNOWN"
                }
              />
              <MetaRow
                icon={Shield}
                label="Issuing Node"
                value={verification?.issuedBy || "CORE_ENGINEERING_HUB"}
              />
              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5 space-y-3 mt-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-xl rounded-full -mr-8 -mt-8" />
                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                   <Zap className="w-3 h-3" /> Compliance Note
                </h5>
                <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
                  This record is secured via multi-layer cryptographic hashing. Any synchronization failure triggers persistent administrative alerts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 pt-8 sm:pt-10 border-t border-white/5 px-4 sm:px-0">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-600 italic">
               © {new Date().getFullYear()} BRAVYNEX ARCHITECTURES. INTEGRITY PERSISTS.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-[7px] sm:text-[9px] font-bold text-gray-700 uppercase tracking-widest">
               <span>Secure Ledger #8829-X</span>
               <div className="w-1 h-1 rounded-full bg-gray-800" />
               <span>Compliance Verified</span>
            </div>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full sm:w-auto border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 h-12 sm:h-14 px-8 sm:px-10 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
            Terminate Link
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/5 p-6 bg-white/[0.02] flex items-center gap-5 group hover:border-white/10 transition-colors">
      <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${accent}`}>
         <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className={`text-lg font-black uppercase tracking-tight italic ${accent}`}>{value}</p>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 space-y-3 group hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
        <Icon className="w-3.5 h-3.5 text-blue-500/60" />
        <span>{label}</span>
      </div>
      <div className="space-y-1">
         <p className="text-xl font-black text-white italic tracking-tight">{value}</p>
         {highlight && (
           <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight className="w-3 h-3 text-purple-500" />
              {highlight}
           </p>
         )}
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 border border-white/5 rounded-2xl p-4 bg-white/[0.02] group hover:border-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-0.5">{label}</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight group-hover:text-white transition-colors">{value}</p>
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
