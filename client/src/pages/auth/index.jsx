import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { Clock, Users } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import ForgotPassword from "@/components/auth/forgot-password";
import ResetPassword from "@/components/auth/reset-password";

function AuthPage() {
  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    activeTab,
    handleTabChange,
    registrationSuccess,
    isRegistering,
    isLoggingIn,
    forgotPasswordEmail,
  } = useContext(AuthContext);

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userName.length >= 4 &&
      signUpFormData.userName.length <= 13 &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== "" &&
      signUpFormData.guardianName !== "" &&
      signUpFormData.guardianName.length >= 4 &&
      signUpFormData.guardianName.length <= 13
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Panel - Reference Matching Design */}
        <div className="hidden lg:flex items-center justify-center border-r border-gray-200">
          <div className="max-w-xl w-full px-8">
            {/* Learning Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm flex items-center gap-8">
              <div className="w-48 h-48 rounded-2xl border border-gray-300 flex items-center justify-center shrink-0">
                <div className="w-28 h-28 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-700" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Learning Time
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-700 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>

            {/* Copy + Stats */}
            <div className="mt-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back to Learning!</h2>
              <p className="text-gray-600">
                Continue your educational journey with Bravynex and unlock new opportunities for growth and success.
              </p>

              <div className="grid grid-cols-3 gap-8 mt-8">
                <div>
                  <div className="text-2xl font-bold text-gray-700">50K+</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">500+</div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-700">4.8</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full flex items-start justify-center pt-10 pb-14">
          <div className="w-full max-w-lg px-6">
            <div className="flex items-center justify-center mb-6">
              <img src="/images/logo.png" alt="BRAVYNEX ENGINEERING" className="h-16" />
            </div>

            <Tabs
              value={activeTab}
              defaultValue="signin"
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="mt-6">
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Student Login</CardTitle>
                    <CardDescription className="text-gray-600">
                      Hey! Enter your details to sign in to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 px-6 pb-6">
                    {/* {registrationSuccess && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm font-medium">
                          🎉 Welcome! Your account has been created successfully. Please sign in below.
                        </p>
                      </div>
                    )} */}

                    <CommonForm
                      formControls={signInFormControls}
                      buttonText={isLoggingIn ? "Signing in..." : "Sign In"}
                      formData={signInFormData}
                      setFormData={setSignInFormData}
                      isButtonDisabled={!checkIfSignInFormIsValid() || isLoggingIn}
                      handleSubmit={handleLoginUser}
                    />

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center text-sm text-gray-600">
                        <input type="checkbox" className="mr-2 rounded border-gray-300" />
                        Having trouble in sign in?
                      </label>
                      <button
                        onClick={() => handleTabChange("forgot")}
                        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative pt-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or sign in with</span>
                      </div>
                    </div>
{/* 
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <span className="mr-2">G</span>
                        Google
                      </button>
                      <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <span className="mr-2">f</span>
                        Facebook
                      </button>
                    </div> */}

                    <div className="text-center pt-4">
                      <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                      <button
                        onClick={() => handleTabChange("signup")}
                        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Sign up here
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="mt-6">
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
                    <CardDescription className="text-gray-600">
                      Enter your details to get started with your learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 px-6 pb-6">
                    {/* {registrationSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">
                          ✅ Registration successful! Please sign in with your credentials.
                        </p>
                      </div>
                    )} */}

                    <CommonForm
                      formControls={signUpFormControls}
                      buttonText={isRegistering ? "Creating Account..." : "Sign Up"}
                      formData={signUpFormData}
                      setFormData={setSignUpFormData}
                      isButtonDisabled={!checkIfSignUpFormIsValid() || isRegistering}
                      handleSubmit={handleRegisterUser}
                    />

                    <div className="text-center pt-2">
                      <p className="text-xs text-gray-500">
                        By signing up, you agree to our{" "}
                        <Link to="/terms" className="text-gray-700 hover:text-gray-900">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-gray-700 hover:text-gray-900">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>

                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-600">Already have an account? </span>
                      <button
                        onClick={() => handleTabChange("signin")}
                        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                      >
                        Sign in here
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Add Forgot Password Tab */}
              <TabsContent value="forgot" className="mt-6">
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password</CardTitle>
                    <CardDescription className="text-gray-600">
                      Enter your email to receive a password reset OTP
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ForgotPassword onBack={handleTabChange} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Add Reset Password Tab */}
              <TabsContent value="reset" className="mt-6">
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
                    <CardDescription className="text-gray-600">
                      Enter the OTP sent to your email and your new password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResetPassword onBack={handleTabChange} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;






