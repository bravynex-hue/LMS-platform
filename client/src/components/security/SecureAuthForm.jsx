import React, { useState, useEffect } from 'react';
import { SecureInput, PasswordStrengthIndicator, useRateLimit, useCSRFToken } from './SecureForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const SecureAuthForm = ({ 
  type = 'login', // 'login', 'register', 'forgot', 'reset'
  onSubmit,
  isLoading = false,
  onTabChange,
  forgotPasswordEmail = ''
}) => {
  const { toast } = useToast();
  const { checkRateLimit, recordAttempt, isBlocked } = useRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  const csrfToken = useCSRFToken();
  
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    password: '',
    confirmPassword: '',
    guardianName: '',
    otp: '',
    newPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Real-time form validation
  useEffect(() => {
    const errors = {};
    
    if (type === 'login') {
      // Email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.userEmail.trim()) {
        errors.userEmail = 'Email is required';
      } else if (!emailRegex.test(formData.userEmail.trim())) {
        errors.userEmail = 'Invalid email format';
      }

      // Password validation
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (type === 'register') {
      // Username validation
      if (!formData.userName.trim()) {
        errors.userName = 'Username is required';
      } else if (formData.userName.trim().length < 3) {
        errors.userName = 'Username must be at least 3 characters';
      } else if (formData.userName.trim().length > 30) {
        errors.userName = 'Username must be less than 30 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.userName.trim())) {
        errors.userName = 'Username can only contain letters, numbers, underscores, and hyphens';
      } else if (/(admin|root|system|test|demo)/i.test(formData.userName.trim())) {
        errors.userName = 'Username contains restricted words';
      }

      // Email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.userEmail.trim()) {
        errors.userEmail = 'Email is required';
      } else if (!emailRegex.test(formData.userEmail.trim())) {
        errors.userEmail = 'Invalid email format';
      }

      // Password validation
      if (!formData.password) {
        errors.password = 'Password is required';
      } else {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          errors.password = 'Password does not meet security requirements';
        }
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Guardian name validation
      if (!formData.guardianName.trim()) {
        errors.guardianName = 'Guardian name is required';
      } else if (formData.guardianName.trim().length < 2) {
        errors.guardianName = 'Guardian name must be at least 2 characters';
      } else if (formData.guardianName.trim().length > 50) {
        errors.guardianName = 'Guardian name must be less than 50 characters';
      } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.guardianName.trim())) {
        errors.guardianName = 'Guardian name contains invalid characters';
      }
    }
    
    if (type === 'forgot') {
      // Email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!formData.userEmail.trim()) {
        errors.userEmail = 'Email is required';
      } else if (!emailRegex.test(formData.userEmail.trim())) {
        errors.userEmail = 'Invalid email format';
      }
    }
    
    if (type === 'reset') {
      // OTP validation
      if (!formData.otp.trim()) {
        errors.otp = 'OTP is required';
      } else if (!/^\d{6}$/.test(formData.otp.trim())) {
        errors.otp = 'OTP must be 6 digits';
      }

      // New password validation
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else {
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
          errors.newPassword = 'Password does not meet security requirements';
        }
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData, type]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNoCommonPatterns = !/(123|abc|password|qwerty|admin)/i.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasNoCommonPatterns,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
        hasNoCommonPatterns,
      },
      score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, hasNoCommonPatterns].filter(Boolean).length,
    };
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check rate limiting
    if (!checkRateLimit()) {
      return;
    }

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    recordAttempt();

    // Add security metadata
    const secureFormData = {
      ...formData,
      _csrf: csrfToken,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      type
    };

    await onSubmit(secureFormData);
  };

  const renderLoginForm = () => (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Secure Login</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <SecureInput
              type="email"
              placeholder="Email Address *"
              value={formData.userEmail}
              onChange={handleInputChange('userEmail')}
              required
              maxLength={100}
              className="w-full"
            />
            {validationErrors.userEmail && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.userEmail}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <SecureInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                maxLength={128}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading || isBlocked}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : isBlocked ? (
              'Rate Limited'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => onTabChange('forgot')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Forgot password?
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRegisterForm = () => (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
        <CardDescription className="text-gray-600">
          Join our secure learning platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <SecureInput
              type="text"
              placeholder="Username *"
              value={formData.userName}
              onChange={handleInputChange('userName')}
              onFocus={() => setFocusedField('userName')}
              onBlur={() => setFocusedField(null)}
              required
              maxLength={30}
              className="w-full"
            />
            {validationErrors.userName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.userName}</p>
            )}
            {/* Certificate note for username field */}
            {focusedField === 'userName' && (
              <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md shadow-sm z-10">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    This username will appear on your course completion certificate
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <SecureInput
              type="email"
              placeholder="Email Address *"
              value={formData.userEmail}
              onChange={handleInputChange('userEmail')}
              required
              maxLength={100}
              className="w-full"
            />
            {validationErrors.userEmail && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.userEmail}</p>
            )}
          </div>

          <div className="relative">
            <SecureInput
              type="text"
              placeholder="Guardian Name *"
              value={formData.guardianName}
              onChange={handleInputChange('guardianName')}
              onFocus={() => setFocusedField('guardianName')}
              onBlur={() => setFocusedField(null)}
              required
              maxLength={50}
              className="w-full"
            />
            {validationErrors.guardianName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.guardianName}</p>
            )}
            {/* Certificate note for guardian name field */}
            {focusedField === 'guardianName' && (
              <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md shadow-sm z-10">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Guardian name will also appear on your course completion certificate
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="relative">
              <SecureInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                maxLength={128}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.password && <PasswordStrengthIndicator password={formData.password} />}
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <SecureInput
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                maxLength={128}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading || isBlocked}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </>
            ) : isBlocked ? (
              'Rate Limited'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Your data is protected with enterprise-grade security
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderForgotPasswordForm = () => (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your email to receive a secure reset code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <SecureInput
              type="email"
              placeholder="Email Address *"
              value={formData.userEmail}
              onChange={handleInputChange('userEmail')}
              required
              maxLength={100}
              className="w-full"
            />
            {validationErrors.userEmail && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.userEmail}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading || isBlocked}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending Code...
              </>
            ) : isBlocked ? (
              'Rate Limited'
            ) : (
              'Send Reset Code'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => onTabChange('login')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back to Login
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const renderResetPasswordForm = () => (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Set New Password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter the code sent to {forgotPasswordEmail} and your new password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <SecureInput
              type="text"
              placeholder="6-digit Code *"
              value={formData.otp}
              onChange={handleInputChange('otp')}
              required
              maxLength={6}
              className="w-full text-center text-lg tracking-widest"
            />
            {validationErrors.otp && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.otp}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <SecureInput
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password *"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                required
                maxLength={128}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {formData.newPassword && <PasswordStrengthIndicator password={formData.newPassword} />}
            {validationErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.newPassword}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <SecureInput
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password *"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                maxLength={128}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isLoading || isBlocked}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Resetting...
              </>
            ) : isBlocked ? (
              'Rate Limited'
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => onTabChange('forgot')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Back
          </button>
        </div>
      </CardContent>
    </Card>
  );

  switch (type) {
    case 'login':
      return renderLoginForm();
    case 'register':
      return renderRegisterForm();
    case 'forgot':
      return renderForgotPasswordForm();
    case 'reset':
      return renderResetPasswordForm();
    default:
      return renderLoginForm();
  }
};

export default SecureAuthForm;
