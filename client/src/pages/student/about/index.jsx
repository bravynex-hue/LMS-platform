
import React from "react";
import { Zap, Building2, Target, Users, Linkedin, Github, Rocket, Globe, Eye, Lightbulb } from "lucide-react";

const TEAM = [

    { 
    id: "rohith", 
    name: "Mr. Rohith AR", 
    role: "Chief Executive Officer", 
    photo: "/images/team/Rohith.jpeg", 
    bio: "Visionary leader driving the strategic direction of Bravynex through innovative business models. Rohith focuses on fostering industrial growth and building global partnerships to empower future engineers. He is dedicated to creating a transformative ecosystem where technology and education meet.", 
    socials: {} // No socials
  },
   { 
    id: "ashwin", 
    name: "Mr. Ashwin N R", 
    role: "Managing Director", 
    photo: "/images/team/Ashwin.jpeg", 
    bio: "Dedicated to operational excellence and sustainable organizational growth within the tech industry. Ashwin ensures that the company's mission aligns with global standards and long-term development. He leads with a commitment to quality and institutional integrity for all our students.", 
    socials: {} // No socials
  },
   { 
    id: "akul", 
    name: "Mr. Akul N S", 
    role: "Manager", 
    photo: "/images/team/Akul.jpeg", 
    bio: "Overseeing project lifecycles and departmental coordination to ensure the highest results. Akul ensures that every goal is met with precision, efficiency, and a high standard of quality control. He acts as the vital link between strategic planning and successful project execution.", 
    socials: {} 
  },
  
  { 
    id: "likhith", 
    name: "Mr. Likhith Kumar K", 
    role: "Administrative Officer", 
    photo: "/images/team/Likhith.png", 
    bio: "Streamlining internal operations and organizational workflows to maintain peak corporate efficiency. Likhith ensures a seamless environment for both the team and students to thrive and achieve excellence. He manages core administrative pillars that uphold the company’s daily success.", 
    socials: {} 
  },
  { 
    id: "tony", 
    name: "Mr. Tony Alex M", 
    role: "Marketing Manager", 
    photo: "/images/team/Tony.jpeg", 
    bio: "Driving outreach initiatives and student engagement to expand our network across the industry. Tony focuses on building community relations and ensuring our programs reach those who need them most. He is dedicated to creating opportunities for professional growth through strategic communication.", 
    socials: {} 
  },
 { 
    id: "sahal", 
    name: "Mohammed Sahal PK", 
    role: "Lead Developer", 
    photo: "/images/team/sahal.jpg", 
    bio: "Lead Developer and Product Architect focused on engineering high-performance, scalable systems that drive business growth. This role involves transforming complex technical requirements into elegant, user-centric digital products while leveraging modern tech stacks to deliver robust solutions that meet the highest possible industry standards and performance benchmarks.", 
    socials: { 
      linkedin: "https://www.linkedin.com/in/mohammedsahalpk/", 
      github: "https://github.com/Mohsahal" 
    } 
  },

 
  { 
    id: "vaibhav", 
    name: "Mr. Vaibhav", 
    role: "Security Analyst", 
    photo: "/images/team/Vaibhav.jpeg", 
    bio: "Expert in cybersecurity and systems integrity focused on protecting critical digital infrastructure. Vaibhav safeguards corporate assets while training students on the vital importance of modern data protection. He ensures every project delivered by the firm meets the highest possible safety standards.", 
    socials: {} 
  },
  { 
    id: "canice", 
    name: "Ms. Canice C N", 
    role: "Digital Marketing Head", 
    photo: "/images/team/Canice.jpeg", 
    bio: "Creative strategist behind our digital presence and global brand identity across all platforms. Canice leverages data-driven marketing to connect our innovative solutions with the wider technology community. She is passionate about building meaningful engagement and telling the story of our journey.", 
    socials: {} 
  },
 
  
  { 
    id: "nireeksha", 
    name: "Ms. Nireeksha", 
    role: "Technical Assistant", 
    photo: "/images/team/Nireeksha.jpeg", 
    bio: "Providing vital technical support and assisting in diverse development projects across the company. Nireeksha ensures that laboratory and project environments are optimized for student and team success. She plays a key role in maintaining technical standards and assisting in daily operations.", 
    socials: {} 
  }
];

function TeamCard({ member }) {
  const hasSocials = member.socials?.linkedin || member.socials?.github;

  return (
    <div className="group relative flex h-full">
      <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
      <div className="relative glass-card p-8 flex flex-col items-center text-center w-full">
        <div className="w-50 h-40 rounded-2xl overflow-hidden mb-6 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors flex-shrink-0">
          <img src={member.photo} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <h3 className="text-xl font-black text-white mb-1">{member.name}</h3>
        <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-4">{member.role}</p>
        
        {/* flex-grow ensures this area stretches to keep the card bottoms aligned */}
        <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
          {member.bio}
        </p>

        {/* This div always has a min-height of 40px, even if empty, to keep card sizes equal */}
        <div className="flex gap-4 min-h-[40px] items-center justify-center">
          {member.socials?.linkedin && (
            <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.socials?.github && (
            <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
              <Github className="w-4 h-4" />
            </a>
          )}
          {/* Spacer logic: if no socials exist, we render nothing, but the min-h-[40px] above holds the space */}
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="min-h-screen text-gray-200 overflow-x-hidden" style={{ background: "var(--bg-dark, #0a0a0a)" }}>
      {/* Background Decor */}
      <div className="orb orb-blue absolute w-[800px] h-[800px] -top-96 -left-96 opacity-[0.03] pointer-events-none" />
      <div className="orb orb-purple absolute w-[600px] h-[600px] bottom-0 right-0 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Hero */}
      <div className="relative pt-32 pb-20 px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="section-badge mb-6 inline-flex items-center gap-2">
            <Zap className="w-3 h-3" /> Empowering Future Engineers
          </span>
          <h2 className="text-4xl sm:text-6xl font-black leading-tight mt-5 mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Our Journey &</span>
            <br /> Innovation
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Bravynex is a forward-thinking product and service-based company dedicated to delivering quality solutions that bridge the gap between academia and industry.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        {/* Objectives Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="glass-card p-8 group h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-blue-500/10 border border-blue-500/20">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">About Bravynex</h2>
            <p className="text-gray-400 leading-relaxed">Product and service-based company dedicated to delivering quality solutions officially registered under MSME, Government of India, ensuring institutional excellence.</p>
          </div>
          <div className="glass-card p-8 group h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-purple-500/10 border border-purple-500/20">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Our Objectives</h2>
            <p className="text-gray-400 leading-relaxed">To empower individuals with skills needed to excel in tech by providing specialized training and real-world project exposure for IT and non-IT sectors.</p>
          </div>
        </div>

        {/* Accreditation */}
        <div className="glass-card p-10 mb-24 text-center relative overflow-hidden">
          <h2 className="text-3xl font-bold text-white mb-6">Accredited & Recognized</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-12">Registered under MSME and NSDC, affiliated with Visveswaraya Technological University (VTU) to ensure high-quality industrial standards.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['nsdc', 'msme', 'vtu', 'skill-india'].map((id) => (
              <div key={id} className="flex flex-col items-center">
                <div className="w-20 h-20 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center mb-2">
                  <img src={`/images/${id}.png`} alt={id} className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentorship & Success */}
        <div className="space-y-32 mb-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-blue-400 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Mentorship</span>
              <h3 className="text-3xl font-black text-white mb-6">Expert Trainer Network</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Our trainers are industry veterans with <span className="text-white font-bold">15+ years of experience</span>, bringing real-world case studies to help you gain skills that are actually in demand.</p>
            </div>
            <div className="w-full lg:w-1/3 rounded-2xl overflow-hidden border border-white/10">
              <img src="/images/pic4.webp" alt="Training" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <span className="text-purple-400 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Success</span>
              <h3 className="text-3xl font-black text-white mb-6">Proven Track Record</h3>
              <p className="text-gray-400 text-lg leading-relaxed">We have <span className="text-white font-bold">successfully trained 500+ students</span> who are now working at leading technology firms globally, thanks to our personalized career support.</p>
            </div>
            <div className="w-full lg:w-1/3 rounded-2xl overflow-hidden border border-white/10">
              <img src="/images/pic2.webp" alt="Success" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Vision/Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
          <div className="glass-card p-10 border-t-2 border-blue-500/20">
            <Eye className="w-8 h-8 text-blue-400 mb-6" />
            <h2 className="text-2xl font-black text-white mb-4">Our Vision</h2>
            <p className="text-gray-400">To be a global leader in delivering innovative products and reliable services that empower businesses and enrich lives through technology.</p>
          </div>
          <div className="glass-card p-10 border-t-2 border-purple-500/20">
            <Lightbulb className="w-8 h-8 text-purple-400 mb-6" />
            <h2 className="text-2xl font-black text-white mb-4">Our Mission</h2>
            <p className="text-gray-400">To create exceptional value for customers through quality products and personalized services, fostering lifelong innovation and integrity.</p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <span className="section-badge mb-4 inline-flex items-center gap-2"><Users className="w-3 h-3" /> Our Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">The Minds Behind <span className="text-blue-400">Bravynex</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {TEAM.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;