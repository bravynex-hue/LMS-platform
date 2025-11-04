import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle, CreditCard } from "lucide-react";

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
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Processing Your Payment</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Please wait while we finalize your payment and enroll you in the course. 
              This usually takes just a few moments.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Congratulations! Your payment has been processed successfully. 
              You&apos;re now enrolled in the course and will be redirected shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Redirecting to your courses...</span>
              </div>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Processing Error</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/student-courses")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to My Courses
              </button>
              <div className="text-sm text-gray-500">
                If you believe this is an error, please contact our support team.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center pb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold">Payment Status</CardTitle>
          <p className="text-blue-100 mt-2">
            {paymentStatus === "processing" && "Finalizing your enrollment..."}
            {paymentStatus === "success" && "Enrollment completed successfully!"}
            {paymentStatus === "error" && "There was an issue with your payment"}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaypalPaymentReturnPage;
