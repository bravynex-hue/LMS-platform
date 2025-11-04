import { useState, useEffect } from 'react';
import { SecureInput, SecureTextarea, useRateLimit, useCSRFToken } from './SecureForm';
import { useToast } from '@/hooks/use-toast';
import { contactAdminService } from '@/services';

const SecureContactForm = () => {
  const { toast } = useToast();
  const { checkRateLimit, recordAttempt, isBlocked } = useRateLimit(5, 60 * 60 * 1000); // 5 attempts per hour
  const csrfToken = useCSRFToken();
  
  const [formData, setFormData] = useState({
    fromName: '',
    fromEmail: '',
    phoneNumber: '',
    course: '',
    segment: '',
    institution: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time form validation
  useEffect(() => {
    const errors = {};
    
    // Name validation
    if (!formData.fromName.trim()) {
      errors.fromName = 'Name is required';
    } else if (formData.fromName.trim().length < 2) {
      errors.fromName = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s\-'.]+$/.test(formData.fromName.trim())) {
      errors.fromName = 'Name contains invalid characters';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.fromEmail.trim()) {
      errors.fromEmail = 'Email is required';
    } else if (!emailRegex.test(formData.fromEmail.trim())) {
      errors.fromEmail = 'Invalid email format';
    }

    // Phone validation (optional, enforce exactly 10 digits when provided)
    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
      if (!/^\d{10}$/.test(cleanPhone)) {
        errors.phoneNumber = 'Enter a valid 10-digit phone number';
      }
    }

    
    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      errors.message = 'Message is too long (max 1000 characters)';
    }

    // Check for spam patterns
    const spamPatterns = [
      /(click here|buy now|free money|make money|work from home)/i,
      /(viagra|casino|poker|lottery)/i,
      /(http|www\.|\.com|\.net|\.org)/i,
      /(bitcoin|cryptocurrency|investment)/i
    ];

    if (spamPatterns.some(pattern => pattern.test(formData.message))) {
      errors.message = 'Message contains prohibited content';
    }

    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData]);

  const handleInputChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'phoneNumber') {
      // Allow only digits and cap at 10
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched when user starts typing
    if (!touchedFields[field]) {
      setTouchedFields(prev => ({
        ...prev,
        [field]: true
      }));
    }
  };

  const handleSelectChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Mark field as touched when user makes a selection
    if (!touchedFields[field]) {
      setTouchedFields(prev => ({
        ...prev,
        [field]: true
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched when form is submitted
    const allFields = ['fromName', 'fromEmail', 'phoneNumber', 'course', 'segment', 'institution', 'message'];
    const newTouchedFields = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);
    
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

    setIsSubmitting(true);
    recordAttempt();

    try {
      // Add CSRF token to form data
      const secureFormData = {
        ...formData,
        _csrf: csrfToken,
        subject: "Website Contact Form Submission",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      };

      const response = await contactAdminService(secureFormData);
      
      if (response?.success) {
        toast({
          title: "Message Sent Successfully!",
          description: "Thank you for your message. We'll get back to you soon.",
        });
        
        // Reset form
        setFormData({
          fromName: '',
          fromEmail: '',
          phoneNumber: '',
          course: '',
          segment: '',
          institution: '',
          message: ''
        });
        // Clear validation and touched states so errors don't show on empty fields
        setTouchedFields({});
        setValidationErrors({});
        setIsFormValid(false);
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Row 1: Name and Course */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <SecureInput
            type="text"
            placeholder="Name *"
            value={formData.fromName}
            onChange={handleInputChange('fromName')}
            required
            maxLength={50}
            showValidation={false}
            className="bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
          />
          {touchedFields.fromName && validationErrors.fromName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.fromName}</p>
          )}
        </div>
        
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
            value={formData.course}
            onChange={handleSelectChange('course')}
          >
            <option value="">Select Course</option>
            <option value="Introduction to Python">Introduction to Python</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Mobile App Development">Mobile App Development</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      {/* Row 2: Email and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <SecureInput
            type="email"
            placeholder="Email *"
            value={formData.fromEmail}
            onChange={handleInputChange('fromEmail')}
            required
            maxLength={100}
            showValidation={false}
            className="bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
          />
          {touchedFields.fromEmail && validationErrors.fromEmail && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.fromEmail}</p>
          )}
        </div>
        
        <div>
          <SecureInput
            type="tel"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            maxLength={20}
            showValidation={false}
            className="bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
          />
          {touchedFields.phoneNumber && validationErrors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
          )}
        </div>
      </div>
      
      {/* Row 3: Segment and Institution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
            value={formData.segment}
            onChange={handleSelectChange('segment')}
          >
            <option value="">Select the segment</option>
            <option value="Student">Student</option>
            <option value="Professional">Professional</option>
            <option value="Educator">Educator</option>
            <option value="Corporate">Corporate</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <SecureInput
            type="text"
            placeholder="Name of the Institution"
            value={formData.institution}
            onChange={handleInputChange('institution')}
            maxLength={100}
            className="bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
          />
        </div>
      </div>
      
      {/* Message */}
      <div>
        <SecureTextarea
          placeholder="Message *"
          value={formData.message}
          onChange={handleInputChange('message')}
          required
          maxLength={1000}
          rows={3}
          showValidation={false}
          className="bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
        />
        {touchedFields.message && validationErrors.message && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.message}</p>
        )}
      </div>
      
      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isSubmitting || !isFormValid || isBlocked}
        className={`inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors duration-200 ${
          isSubmitting || !isFormValid || isBlocked
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-black text-white hover:bg-black/90'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Sending...
          </>
        ) : isBlocked ? (
          'Rate Limited'
        ) : (
          'Submit →'
        )}
      </button>
      
      {/* Security Notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        🔒 Your information is protected with enterprise-grade security. We never share your data.
      </p>
    </form>
  );
};

export default SecureContactForm;
