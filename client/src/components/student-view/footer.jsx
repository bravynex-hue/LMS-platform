import { useState } from "react";
import { Link } from "react-router-dom";
import { contactAdminService } from "@/services";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import SecureContactForm from "../security/SecureContactForm";

const EXPLORE_LINKS = [
  { label: "Home", to: "/home" },
  { label: "Courses", to: "/courses" },
  { label: "My Courses", to: "/student-courses" },
  { label: "About Us", to: "/about" },
];

const RESOURCE_LINKS = [
  { label: "Blog", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

const SOCIAL_LINKS = [
  {
    icon: Twitter, href: "#", label: "Twitter",
    color: "#1da1f2",
  },
  {
    icon: Facebook, href: "https://www.facebook.com/share/1Jp7Lpocmd/?mibextid=wwXIfr",
    label: "Facebook", color: "#1877f2",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/bravynexengineering?igsh=MTdnbmVyaGR0amExcA%3D%3D&utm_source=qr",
    label: "Instagram", color: "#e1306c",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/bravynex-engineering-a8211836b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    label: "LinkedIn", color: "#0077b5",
  },
];

function Footer() {

  return (
    <footer className="relative mt-0 overflow-hidden"
      style={{
        background: "rgba(2,6,23,0.95)",
        borderTop: "1px solid rgba(59,130,246,0.1)",
      }}>

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), rgba(168,85,247,0.4), transparent)" }} />

      {/* Background orbs */}
      <div className="orb orb-blue absolute w-[400px] h-[400px] -bottom-20 -left-20 opacity-5 pointer-events-none" />
      <div className="orb orb-purple absolute w-[300px] h-[300px] top-0 right-0 opacity-5 pointer-events-none" />

      {/* Main grid */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="lg:col-span-1">
          {/* Logo mark */}
          {/* <div className="flex items-center gap-2 mb-4">
           
           <img src="/images/logo.png" alt="BravyNex Logo" style={{ maxHeight: '120px', maxWidth: '200px', objectFit: 'contain', transition: 'transform 0.2s'}} />
            
          </div> */}

          <p className="text-sm font-semibold mb-1" style={{ color: "#94a3b8" }}>
            BRAVYNEX ENGINEERING
          </p>
          <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
            Cultivating success together — your premier gateway to engineering internship excellence.
          </p>

          {/* Contact info */}
          <div className="space-y-2.5">
            {[
              { icon: MapPin, text: "First Floor-113, Paradise Building, Padil, Mangalore" },
              { icon: Phone, text: "+91 9019 659 246", href: "tel:+919019659246" },
              { icon: Mail, text: "bravynex@gmail.com", href: "mailto:bravynex@gmail.com" },
            ].map(({ icon: Icon, text, href }) => (
              <div key={text} className="flex items-start gap-2.5">
                <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#3b82f6" }} />
                {href ? (
                  <a href={href} className="text-xs transition-colors duration-200 hover:text-blue-400"
                    style={{ color: "#94a3b8" }}>
                    {text}
                  </a>
                ) : (
                  <span className="text-xs" style={{ color: "#94a3b8" }}>{text}</span>
                )}
              </div>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-5">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.color = color; 
                  e.currentTarget.style.borderColor = `${color}60`; 
                  e.currentTarget.style.background = `${color}15`; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.color = "#94a3b8"; 
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; 
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Explore column */}
        <div>
          <h4 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: "#f0f9ff" }}>
            <span className="w-1 h-4 rounded-full inline-block"
              style={{ background: "linear-gradient(180deg, #3b82f6, #a855f7)" }} />
            Explore
          </h4>
          <ul className="space-y-2.5">
            {EXPLORE_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm flex items-center gap-2 group transition-all duration-300"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#60a5fa"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 scale-0 group-hover:scale-100 transition-transform duration-300" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources column */}
        <div>
          <h4 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: "#f0f9ff" }}>
            <span className="w-1 h-4 rounded-full inline-block"
              style={{ background: "linear-gradient(180deg, #a855f7, #06b6d4)" }} />
            Resources
          </h4>
          <ul className="space-y-2.5">
            {RESOURCE_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="text-sm flex items-center gap-2 group transition-all duration-300"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#a855f7"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                >
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-all group-hover:scale-110" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact form column */}
        <div>
          <h4 className="text-sm font-bold mb-5 flex items-center gap-2" style={{ color: "#f0f9ff" }}>
            <span className="w-1 h-4 rounded-full inline-block"
              style={{ background: "linear-gradient(180deg, #06b6d4, #3b82f6)" }} />
            Contact Us
          </h4>
          <SecureContactForm />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t" style={{ borderColor: "rgba(59,130,246,0.08)" }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "white" }}>
            © {new Date().getFullYear()} Bravynex Engineering. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "white" }}>
            <span>Crafted with</span>
            <span style={{ color: "#ef4444" }}>♥</span>
            <span>for the next generation of engineers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
