import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import PropTypes from 'prop-types';

// Security utilities
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

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

const detectSuspiciousActivity = (input) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
};

// Secure Input Component
export const SecureInput = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  maxLength = 255,
  className = '',
  showValidation = true,
  ...props 
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Mark as touched when user starts typing
    if (!isTouched) {
      setIsTouched(true);
    }
    
    // Detect suspicious activity
    if (detectSuspiciousActivity(inputValue)) {
      setErrorMessage('Invalid input detected');
      setIsValid(false);
      return;
    }

    // Sanitize input
    const sanitizedValue = sanitizeInput(inputValue);
    
    // Validate based on type
    let validation = { isValid: true, message: '' };
    
    if (type === 'email' && sanitizedValue) {
      validation.isValid = validateEmail(sanitizedValue);
      validation.message = validation.isValid ? '' : 'Invalid email format';
    }
    
    if (type === 'password' && sanitizedValue) {
      const passwordValidation = validatePassword(sanitizedValue);
      validation.isValid = passwordValidation.isValid;
      validation.message = validation.isValid ? '' : 'Password does not meet security requirements';
    }
    
    if (required && !sanitizedValue.trim()) {
      validation.isValid = false;
      validation.message = 'This field is required';
    }
    
    if (sanitizedValue.length > maxLength) {
      validation.isValid = false;
      validation.message = `Input too long (max ${maxLength} characters)`;
    }

    setIsValid(validation.isValid);
    setErrorMessage(validation.message);
    
    // Call parent onChange with sanitized value
    onChange({
      ...e,
      target: {
        ...e.target,
        value: sanitizedValue
      }
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isValid ? 'border-gray-300' : 'border-red-500'
        } ${className}`}
        {...props}
      />
      {showValidation && isTouched && !isValid && errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

// PropTypes for SecureInput
SecureInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  showValidation: PropTypes.bool,
};

// Secure Textarea Component
export const SecureTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  required = false,
  maxLength = 1000,
  rows = 4,
  className = '',
  showValidation = true,
  ...props 
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Mark as touched when user starts typing
    if (!isTouched) {
      setIsTouched(true);
    }
    
    // Detect suspicious activity
    if (detectSuspiciousActivity(inputValue)) {
      setErrorMessage('Invalid input detected');
      setIsValid(false);
      return;
    }

    // Sanitize input
    const sanitizedValue = sanitizeInput(inputValue);
    setCharCount(sanitizedValue.length);
    
    // Validate
    let validation = { isValid: true, message: '' };
    
    if (required && !sanitizedValue.trim()) {
      validation.isValid = false;
      validation.message = 'This field is required';
    }
    
    if (sanitizedValue.length > maxLength) {
      validation.isValid = false;
      validation.message = `Input too long (max ${maxLength} characters)`;
    }

    // Check for spam patterns
    const spamPatterns = [
      /(click here|buy now|free money|make money)/i,
      /(http|www\.|\.com)/i,
      /(bitcoin|cryptocurrency)/i
    ];

    if (spamPatterns.some(pattern => pattern.test(sanitizedValue))) {
      validation.isValid = false;
      validation.message = 'Message contains prohibited content';
    }

    setIsValid(validation.isValid);
    setErrorMessage(validation.message);
    
    // Call parent onChange with sanitized value
    onChange({
      ...e,
      target: {
        ...e.target,
        value: sanitizedValue
      }
    });
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
          isValid ? 'border-gray-300' : 'border-red-500'
        } ${className}`}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        {showValidation && isTouched && !isValid && errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        <p className="text-gray-500 text-sm ml-auto">
          {charCount}/{maxLength}
        </p>
      </div>
    </div>
  );
};

// PropTypes for SecureTextarea
SecureTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  className: PropTypes.string,
  showValidation: PropTypes.bool,
};

// Password Strength Indicator
export const PasswordStrengthIndicator = ({ password }) => {
  const validation = validatePassword(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strengthColors[validation.score - 1] || 'bg-gray-300'
            }`}
            style={{ width: `${(validation.score / 5) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">
          {strengthLabels[validation.score - 1] || 'Very Weak'}
        </span>
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-1">
          <div className={`flex items-center ${validation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{validation.requirements.minLength ? '✓' : '✗'}</span>
            Min 8 characters
          </div>
          <div className={`flex items-center ${validation.requirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{validation.requirements.hasUpperCase ? '✓' : '✗'}</span>
            Uppercase letter
          </div>
          <div className={`flex items-center ${validation.requirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{validation.requirements.hasLowerCase ? '✓' : '✗'}</span>
            Lowercase letter
          </div>
          <div className={`flex items-center ${validation.requirements.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{validation.requirements.hasNumbers ? '✓' : '✗'}</span>
            Number
          </div>
          <div className={`flex items-center ${validation.requirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{validation.requirements.hasSpecialChar ? '✓' : '✗'}</span>
            Special character
          </div>
          <div className={`flex items-center ${validation.requirements.hasNoCommonPatterns ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{validation.requirements.hasNoCommonPatterns ? '✓' : '✗'}</span>
            No common patterns
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes for PasswordStrengthIndicator
PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string.isRequired,
};

// Rate Limiting Hook
export const useRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const [attempts, setAttempts] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      setIsBlocked(true);
      toast({
        title: "Rate limit exceeded",
        description: "Too many attempts. Please try again later.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const recordAttempt = () => {
    const now = Date.now();
    setAttempts(prev => [...prev.filter(time => now - time < windowMs), now]);
  };

  const resetAttempts = () => {
    setAttempts([]);
    setIsBlocked(false);
  };

  return { checkRateLimit, recordAttempt, resetAttempts, isBlocked };
};

// CSRF Token Hook - Now uses server-generated tokens
export const useCSRFToken = () => {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch CSRF token from server
    const fetchCsrfToken = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await fetch(`${base.replace(/\/$/, '')}/csrf-token`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.csrfToken) {
            setCsrfToken(data.csrfToken);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  return csrfToken;
};

export default {
  SecureInput,
  SecureTextarea,
  PasswordStrengthIndicator,
  useRateLimit,
  useCSRFToken,
  sanitizeInput,
  validateEmail,
  validatePassword,
  detectSuspiciousActivity
};
