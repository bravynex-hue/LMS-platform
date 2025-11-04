import { useState } from "react";
import { Link } from "react-router-dom";
import { contactAdminService } from "@/services";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import SecureContactForm from "../security/SecureContactForm";

function Footer() {
  const [contactForm, setContactForm] = useState({ 
    fromName: "", 
    fromEmail: "", 
    phoneNumber: "",
    course: "",
    segment: "",
    institution: "",
    message: "" 
  });
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function handleContactSubmit(e) {
    e.preventDefault();
    setStatusMsg("");
    setSending(true);
    try {
      // Ensure all fields are sent, even if empty
      const formData = {
        fromEmail: contactForm.fromEmail || '',
        fromName: contactForm.fromName || '',
        phoneNumber: contactForm.phoneNumber || '',
        course: contactForm.course || '',
        segment: contactForm.segment || '',
        institution: contactForm.institution || '',
        message: contactForm.message || '',
        subject: "Website contact form submission",
      };
      
      console.log("=== Form Data Being Sent ===");
      console.log("fromName:", formData.fromName, "| Type:", typeof formData.fromName);
      console.log("fromEmail:", formData.fromEmail, "| Type:", typeof formData.fromEmail);
      console.log("phoneNumber:", formData.phoneNumber, "| Type:", typeof formData.phoneNumber);
      console.log("course:", formData.course, "| Type:", typeof formData.course);
      console.log("segment:", formData.segment, "| Type:", typeof formData.segment);
      console.log("institution:", formData.institution, "| Type:", typeof formData.institution);
      console.log("message:", formData.message, "| Type:", typeof formData.message);
      console.log("===========================");
      
      // Also log the original contactForm state
      console.log("=== Original Contact Form State ===");
      console.log("contactForm:", contactForm);
      console.log("===================================");
      
      const res = await contactAdminService(formData);
      setStatusMsg(res?.success ? "Message sent successfully." : res?.message || "Failed to send.");
      if (res?.success) setContactForm({ 
        fromName: "", 
        fromEmail: "", 
        phoneNumber: "",
        course: "",
        segment: "",
        institution: "",
        message: "" 
      });
    } catch (err) {
      setStatusMsg(err?.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="mt-12 border-t bg-gray-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">BRAVYNEX ENGINEERING</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Cultivating success together.</p>
          <div className="flex items-center gap-3 mt-4 text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4" />
            <span>Global • Remote-first</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <Phone className="h-4 w-4" />
            <a href="tel:+18058011389" className="hover:underline">+1 (805) 801-1389</a>
          </div>
          <div className="flex items-center gap-3 mt-2 text-gray-600 dark:text-gray-300">
            <Mail className="h-4 w-4" />
            <a href="mailto:bravynex@gmail.com" className="hover:underline">bravynex@gmail.com</a>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <a className="text-blue-400 hover:text-blue-500 transition-colors duration-200" href="#" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
            <a className="text-blue-600 hover:text-blue-700 transition-colors duration-200" href="https://www.facebook.com/share/1Jp7Lpocmd/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            <a className="text-pink-500 hover:text-pink-600 transition-colors duration-200" href="https://www.instagram.com/bravynexengineering?igsh=MTdnbmVyaGR0amExcA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            <a className="text-blue-700 hover:text-blue-800 transition-colors duration-200" href="https://www.linkedin.com/in/bravynex-engineering-a8211836b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><Link to="/home" className="hover:underline">Home</Link></li>
            <li><Link to="/courses" className="hover:underline">Courses</Link></li>
            <li><Link to="/student-courses" className="hover:underline">My Courses</Link></li>
            {/* <li><Link to="/about" className="hover:underline">About</Link></li> */}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li><a className="hover:underline" href="#">Blog</a></li>
            <li><a className="hover:underline" href="#">Help Center</a></li>
            <li><a className="hover:underline" href="#">Terms of Service</a></li>
            <li><a className="hover:underline" href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Contact Us</h4>
          <SecureContactForm />
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-5">© {new Date().getFullYear()} Bravynex Engineering. All rights reserved.</div>
    </footer>
  );
}

export default Footer;


