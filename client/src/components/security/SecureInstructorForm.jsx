import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';

// Secure Input Component for Instructor Forms
export const SecureInstructorInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  maxLength = 255,
  className = '',
  showValidation = true,
  label = '',
  description = '',
  ...props
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef(null);

  // Sanitize input value
  const sanitizeInput = (inputValue) => {
    if (typeof inputValue !== 'string') return inputValue;
    
    // Remove potentially dangerous characters
    let sanitized = inputValue
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
    
    // Additional sanitization based on input type
    if (type === 'email') {
      sanitized = sanitized.toLowerCase();
    } else if (type === 'url') {
      // Validate URL format
      try {
        new URL(sanitized);
      } catch {
        sanitized = '';
      }
    }
    
    return sanitized;
  };

  // Validate input
  const validateInput = (inputValue) => {
    const errors = [];
    
    if (required && (!inputValue || inputValue.trim() === '')) {
      errors.push('This field is required');
    }
    
    if (inputValue && inputValue.length > maxLength) {
      errors.push(`Maximum length is ${maxLength} characters`);
    }
    
    // Type-specific validation
    if (type === 'email' && inputValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    if (type === 'url' && inputValue) {
      try {
        new URL(inputValue);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    if (type === 'number' && inputValue) {
      const num = parseFloat(inputValue);
      if (isNaN(num)) {
        errors.push('Please enter a valid number');
      }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /\.\.\//g, // Path traversal
      /union\s+select/i, // SQL injection
      /drop\s+table/i, // SQL injection
      /insert\s+into/i, // SQL injection
      /delete\s+from/i, // SQL injection
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(inputValue)) {
        errors.push('Invalid characters detected');
        break;
      }
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    if (!isTouched) {
      setIsTouched(true);
    }
    
    const sanitizedValue = sanitizeInput(inputValue);
    const errors = validateInput(sanitizedValue);
    
    setIsValid(errors.length === 0);
    setErrorMessage(errors[0] || '');
    
    // Create new event with sanitized value
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitizedValue
      }
    };
    
    onChange(sanitizedEvent);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          isValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
        } ${className}`}
        {...props}
      />
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      
      {showValidation && isTouched && !isValid && errorMessage && (
        <p className="text-red-500 text-sm">{errorMessage}</p>
      )}
    </div>
  );
};

SecureInstructorInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  className: PropTypes.string,
  showValidation: PropTypes.bool,
  label: PropTypes.string,
  description: PropTypes.string,
};

// Secure Textarea Component for Instructor Forms
export const SecureInstructorTextarea = ({
  value,
  onChange,
  placeholder,
  required = false,
  maxLength = 2000,
  rows = 4,
  className = '',
  showValidation = true,
  label = '',
  description = '',
  ...props
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isTouched, setIsTouched] = useState(false);

  // Sanitize textarea content
  const sanitizeContent = (content) => {
    if (typeof content !== 'string') return content;
    
    // Use DOMPurify for HTML sanitization
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: []
    });
    
    // Remove any remaining dangerous patterns
    return sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  };

  // Validate textarea content
  const validateContent = (content) => {
    const errors = [];
    
    if (required && (!content || content.trim() === '')) {
      errors.push('This field is required');
    }
    
    if (content && content.length > maxLength) {
      errors.push(`Maximum length is ${maxLength} characters`);
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /\.\.\//g,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        errors.push('Invalid content detected');
        break;
      }
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const content = e.target.value;
    
    if (!isTouched) {
      setIsTouched(true);
    }
    
    const sanitizedContent = sanitizeContent(content);
    const errors = validateContent(sanitizedContent);
    
    setIsValid(errors.length === 0);
    setErrorMessage(errors[0] || '');
    setCharCount(sanitizedContent.length);
    
    // Create new event with sanitized content
    const sanitizedEvent = {
      ...e,
      target: {
        ...e.target,
        value: sanitizedContent
      }
    };
    
    onChange(sanitizedEvent);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors ${
          isValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
        } ${className}`}
        {...props}
      />
      
      <div className="flex justify-between items-center">
        {showValidation && isTouched && !isValid && errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
        <p className="text-gray-500 text-sm ml-auto">
          {charCount}/{maxLength}
        </p>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

SecureInstructorTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  className: PropTypes.string,
  showValidation: PropTypes.bool,
  label: PropTypes.string,
  description: PropTypes.string,
};

// Secure File Upload Component
export const SecureInstructorFileUpload = ({
  onChange,
  accept = "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip,.rar",
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB
  multiple = false,
  className = '',
  label = '',
  description = '',
  showValidation = true,
  ...props
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Allowed file types
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
  ];

  // Dangerous file extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1',
    '.dll', '.sys', '.drv', '.msi', '.deb', '.rpm', '.app', '.dmg'
  ];

  // Validate file
  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }
    
    // Check file extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (dangerousExtensions.includes(extension)) {
      errors.push('Dangerous file type detected');
    }
    
    // Check filename for suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//g, // Path traversal
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        errors.push('Invalid filename detected');
        break;
      }
    }
    
    return errors;
  };

  const handleFileChange = (files) => {
    if (!isTouched) {
      setIsTouched(true);
    }
    
    const fileList = Array.from(files);
    const errors = [];
    
    // Validate each file
    for (const file of fileList) {
      const fileErrors = validateFile(file);
      errors.push(...fileErrors);
    }
    
    setIsValid(errors.length === 0);
    setErrorMessage(errors[0] || '');
    
    if (errors.length === 0) {
      onChange(files);
    }
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : isValid 
              ? 'border-gray-300 hover:border-gray-400' 
              : 'border-red-500'
        } ${className}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>
            {' '}or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            {accept}
          </p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        {...props}
      />
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      
      {showValidation && isTouched && !isValid && errorMessage && (
        <p className="text-red-500 text-sm">{errorMessage}</p>
      )}
    </div>
  );
};

SecureInstructorFileUpload.propTypes = {
  onChange: PropTypes.func.isRequired,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  multiple: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  showValidation: PropTypes.bool,
};

// Secure Form Container
export const SecureInstructorForm = ({ children, onSubmit, className = '', ...props }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add CSRF token to form data
      const formData = new FormData(e.target);
      if (csrfToken) {
        formData.append('_csrf', csrfToken);
      }
      
      await onSubmit(e, formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      {csrfToken && <input type="hidden" name="_csrf" value={csrfToken} />}
      {children}
    </form>
  );
};

SecureInstructorForm.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  className: PropTypes.string,
};
