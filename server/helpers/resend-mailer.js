const fetch = require("node-fetch");

// Resend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_JUodk58j_PtJpbXXSjgvu4du4EY76PEq1";
const RESEND_API_URL = "https://api.resend.com/emails";
// Resend requires onboarding@resend.dev for testing or your verified domain
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mohammedsahal1243@gmail.com";

/**
 * Send contact form email using Resend API
 */
async function sendAdminContactEmail({ 
  fromEmail, 
  fromName, 
  phoneNumber,
  course,
  segment,
  institution,
  message, 
  subject 
}) {
  console.log("📧 [RESEND] Sending contact form email...");
  
  try {
    // Process values
    const displayName = (fromName && fromName.trim() !== '') ? fromName : 'Not provided';
    const displayEmail = (fromEmail && fromEmail.trim() !== '') ? fromEmail : 'Not provided';
    const displayPhone = (phoneNumber && phoneNumber.trim() !== '') ? phoneNumber : 'Not provided';
    const displayCourse = (course && course.trim() !== '') ? course : 'Not specified';
    const displaySegment = (segment && segment.trim() !== '') ? segment : 'Not specified';
    const displayInstitution = (institution && institution.trim() !== '') ? institution : 'Not provided';
    const displayMessage = (message && message.trim() !== '') ? message : 'No message provided';

    // Email content
    const emailText = `
New Contact Form Submission

Name: ${displayName}
Email: ${displayEmail}
Phone: ${displayPhone}
Course Interest: ${displayCourse}
Segment: ${displaySegment}
Institution: ${displayInstitution}

Message:
${displayMessage}

---
This email was sent from the BravyNex Engineering contact form.
    `.trim();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #555; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${displayName}</p>
          <p><strong>Email:</strong> ${displayEmail}</p>
          <p><strong>Phone:</strong> ${displayPhone}</p>
          <p><strong>Course Interest:</strong> ${displayCourse}</p>
          <p><strong>Segment:</strong> ${displaySegment}</p>
          <p><strong>Institution:</strong> ${displayInstitution}</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #555; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${displayMessage.replace(/\n/g, '<br/>')}</p>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          This email was sent from the BravyNex Engineering contact form.
        </p>
      </div>
    `;

    const emailData = {
      from: `BravyNex Engineering <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      reply_to: displayEmail !== 'Not provided' ? displayEmail : undefined,
      subject: subject || "New Contact Form Submission - BravyNex Engineering",
      html: emailHtml,
      text: emailText
    };

    console.log(`📤 [RESEND] From: ${FROM_EMAIL}`);
    console.log(`📤 [RESEND] To: ${ADMIN_EMAIL}`);
    console.log(`📤 [RESEND] Reply-to: ${emailData.reply_to || 'N/A'}`);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ [RESEND] API Error:", response.status, responseData);
      throw new Error(`Resend API error: ${responseData.message || response.statusText}`);
    }

    console.log("✅ [RESEND] Contact email sent successfully!");
    console.log(`📬 [RESEND] Message ID: ${responseData.id}`);

    return { 
      messageId: responseData.id,
      success: true,
      method: 'resend'
    };
  } catch (error) {
    console.error("❌ [RESEND] Error sending contact email:", error.message);
    throw new Error(`Failed to send contact email: ${error.message}`);
  }
}

/**
 * Send OTP email using Resend API
 */
async function sendOTPEmail({ email, otp }) {
  console.log(`📧 [RESEND] Sending OTP email to: ${email}`);
  
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">BravyNex Engineering</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
          <h2 style="margin: 0 0 10px 0;">Password Reset Request</h2>
          <p style="margin: 0; opacity: 0.9;">Use the OTP code below to reset your password</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">Your One-Time Password (OTP)</p>
          <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; border: 2px dashed #667eea;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">This code will expire in 10 minutes</p>
        </div>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated email from BravyNex Engineering LMS Platform
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
            © ${new Date().getFullYear()} BravyNex Engineering. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const emailText = `
BravyNex Engineering - Password Reset

Your OTP for password reset is: ${otp}

This OTP will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

---
This is an automated email from BravyNex Engineering LMS Platform
    `.trim();

    const emailData = {
      from: `BravyNex Engineering <${FROM_EMAIL}>`,
      to: [email],
      subject: "Password Reset OTP - BravyNex Engineering",
      html: emailHtml,
      text: emailText
    };

    console.log(`📤 [RESEND] Sending OTP to: ${email}`);

    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ [RESEND] API Error:", response.status, responseData);
      throw new Error(`Resend API error: ${responseData.message || response.statusText}`);
    }

    console.log("✅ [RESEND] OTP email sent successfully!");
    console.log(`📬 [RESEND] Message ID: ${responseData.id}`);
    console.log(`🔐 [RESEND] OTP: ${otp} (for logging purposes only)`);

    return { 
      messageId: responseData.id,
      success: true,
      method: 'resend'
    };
  } catch (error) {
    console.error("❌ [RESEND] Error sending OTP email:", error.message);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
}

module.exports = { 
  sendAdminContactEmail, 
  sendOTPEmail 
};
