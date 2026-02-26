import { captureAndFinalizePaymentService } from "@/services";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle, CreditCard, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function PaypalPaymentReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");
  
  const [paymentStatus, setPaymentStatus] = useState("processing"); // processing, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (paymentId && payerId) {
      async function capturePayment() {
        try {
          setPaymentStatus("processing");
          const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

          const response = await captureAndFinalizePaymentService(
            paymentId,
            payerId,
            orderId
          );

          if (response?.success) {
            setPaymentStatus("success");
            sessionStorage.removeItem("currentOrderId");
            
            // Redirect after showing success message
            setTimeout(() => {
              navigate("/student-courses");
            }, 3000);
          } else {
            setPaymentStatus("error");
            setErrorMessage(response?.message || "Payment processing failed");
          }
        } catch {
          setPaymentStatus("error");
          setErrorMessage("An unexpected error occurred. Please contact support.");
        }
      }

      capturePayment();
    } else {
      setPaymentStatus("error");
      setErrorMessage("Invalid payment parameters");
    }
  }, [payerId, paymentId, navigate]);

  const renderContent = () => {
    switch (paymentStatus) {
      case "processing":
        return (
          <div className="text-center py-12 space-y-8 animate-in fade-in duration-700">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Verifying Transaction</h2>
              <p className="text-gray-400 max-w-sm mx-auto font-medium">
                Establishing handshake with payment gateway. Please remain on this frequency.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-12 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Deployment Successful</h2>
              <p className="text-gray-400 max-w-sm mx-auto font-medium">
                Authorization confirmed. Enrolling you into the architectural tracks.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 animate-pulse">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Redirecting to Central Hub...</span>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Signal Aborted</h2>
              <p className="text-red-400/70 max-w-sm mx-auto font-bold uppercase text-[10px] tracking-widest">
                Error Log: {errorMessage || "GENERIC_HANDSHAKE_FAILURE"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Button 
                onClick={() => navigate("/student-courses")}
                className="bg-white text-black hover:bg-gray-200 px-8 h-12 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
              >
                Return to Hub
              </Button>
              <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Contact technical attache if issue persists</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200 flex items-center justify-center p-6" style={{ background: "var(--bg-dark)" }}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
      </div>

      <Card className="w-full max-w-2xl glass-card border-white/10 shadow-3xl overflow-hidden relative z-10">
        <CardHeader className="bg-white/[0.02] border-b border-white/5 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-sm font-black uppercase tracking-[0.4em] text-gray-500">Transaction Status Protocol</CardTitle>
          <div className="mt-4 flex items-center justify-center gap-3">
             <div className="h-px w-8 bg-white/10" />
             <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60">
                {paymentStatus === "processing" && "SYNC_IN_PROGRESS"}
                {paymentStatus === "success" && "VERIFICATION_COMPLETE"}
                {paymentStatus === "error" && "PROTOCOL_FAILED"}
             </p>
             <div className="h-px w-8 bg-white/10" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
        <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-800">Bravynex Engineering Secure Payment Gateway v2.4.0</p>
        </div>
      </Card>
    </div>
  );
}

export default PaypalPaymentReturnPage;
