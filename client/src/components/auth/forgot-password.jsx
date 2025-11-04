import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/context/auth-context";
import { useContext, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPassword({ onBack }) {
  const { handleForgotPassword, isRequestingOTP } = useContext(AuthContext);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleForgotPassword(email);
    if (success) {
      onBack("reset"); // Switch to reset password view
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you an OTP to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onBack("signin")}
              className="w-full"
            >
              Back to Login
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isRequestingOTP}
            >
              {isRequestingOTP ? "Sending OTP..." : "Send OTP"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}