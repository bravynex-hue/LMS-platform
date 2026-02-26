import { 
  Building2,
  Target, 
  Eye,
  CheckCircle,
  Lightbulb,
  Zap,
  Globe,
  Rocket,
  Users,
  Linkedin,
  Github
} from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen text-gray-200" style={{ background: "var(--bg-dark)" }}>
      {/* Background elements */}
      <div className="orb orb-blue absolute w-[800px] h-[800px] -top-96 -left-96 opacity-[0.03] pointer-events-none" />
      <div className="orb orb-purple absolute w-[600px] h-[600px] bottom-0 right-0 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="section-badge mb-6 inline-flex">
            <Zap className="w-3 h-3" />
            Empowering Future Engineers
          </span>
          <h2 className="text-3xl sm:text-6xl font-black leading-tight mt-5 mb-6">
            <span style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Our Journey &
            </span>
            <br className="hidden sm:block" />
            <span style={{ color: "#f0f9ff" }}> Innovation</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Bravynex is a forward-thinking product and service-based company dedicated to delivering quality solutions that bridge the gap between academia and industry.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        
        {/* About & Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">About Bravynex</h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                Product and service-based company dedicated to delivering quality solutions that meet customer needs across hardware and software domains.
              </p>
              <p>
                Officially registered under the Ministry of Micro, Small and Medium Enterprises (MSME), Government of India, ensuring reliability and institutional excellence.
              </p>
            </div>
          </div>

          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}>
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Our Objectives</h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                To empower individuals with the skills and knowledge needed to excel in the tech industry by providing specialized training programs and real-world project exposure.
              </p>
              <p>
                Focused on upskilling talent in IT and non-IT sectors, helping them secure dream placements through hands-on practice.
              </p>
            </div>
          </div>
        </div>

        {/* Registered Under Section */}
        <div className="glass-card p-10 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -z-10" />
          <h2 className="text-3xl font-bold text-center text-white mb-10">Accredited & Recognized</h2>
          <p className="text-gray-400 leading-relaxed max-w-4xl mx-auto text-center mb-12">
            Registered under MSME and NSDC, we design impactful courses affiliated with <span className="text-blue-400 font-semibold">Visveswaraya Technological University (VTU)</span>. Our curriculum stays dynamic, blending industry expertise with innovation to help learners achieve meaningful career progress.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {[
              { id: 'nsdc', label: 'NSDC' },
              { id: 'msme', label: 'MSME' },
              { id: 'vtu', label: 'VTU' },
              { id: 'skill-india', label: 'Skill India' }
            ].map((logo) => (
              <div key={logo.id} className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <img 
                    src={`/images/${logo.id}.png`} 
                    alt={logo.label} 
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-gray-600">{logo.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Sections with Alternating Layouts */}
        <div className="space-y-32 mb-24">
          {/* Trainer Expertise */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <span className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-widest uppercase">
                <Rocket className="w-4 h-4" /> Mentorship
              </span>
              <h3 className="text-3xl font-black text-white">Expert Trainer Network</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Our trainers are industry veterans with <span className="text-white font-bold">over 15 years of practical experience</span>. They bring deep domain expertise, real-world case studies, and modern teaching methodologies to ensure you gain skills that are actually in demand.
              </p>
            </div>
            <div className="w-full lg:w-1/3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <img 
                  src="/images/pic4.webp" 
                  alt="Expert Trainer" 
                  className="relative rounded-2xl w-full object-cover border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Student Success */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <span className="flex items-center gap-2 text-purple-400 font-bold text-sm tracking-widest uppercase">
                <Globe className="w-4 h-4" /> Success
              </span>
              <h3 className="text-3xl font-black text-white">Proven Track Record</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                We take pride in having <span className="text-white font-bold">successfully trained over 500+ students</span> who are now working at leading technology firms. Our learners appreciate the flexibility, practical focus, and the personalized career support that transforms their aspirations into reality.
              </p>
            </div>
            <div className="w-full lg:w-1/3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <img 
                  src="/images/pic2.webp" 
                  alt="Student Success" 
                  className="relative rounded-2xl w-full object-cover border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          <div className="glass-card p-10 relative group border-t-2 border-blue-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Our Vision</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              To be a global leader in delivering innovative products and reliable services that empower businesses and enrich lives through technology.
            </p>
          </div>

          <div className="glass-card p-10 relative group border-t-2 border-purple-500/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 border border-purple-500/20">
                <Lightbulb className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Our Mission</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              To create exceptional value for customers through quality products and personalized services. We foster lifelong innovation and integrity in every project.
            </p>
          </div>
        </div>

        {/* Leadership & Team Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <span className="section-badge mb-4 inline-flex">
              <Users className="w-3 h-3" />
              Our Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white px-4">The Minds Behind <span className="text-blue-400">Bravynex</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {/* Lead Developer Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative glass-card p-8 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-2xl overflow-hidden mb-6 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors">
                  <img 
                    src="/images/lead-dev.jpg" 
                    alt="Lead Developer" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-xl font-black text-white mb-1">Mohammed Sahal</h3>
                <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-4">Lead Developer </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Specialized in full-stack architecture and interactive engineering systems. Driving the technical vision and premium user experience of the Bravynex platform.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://www.linkedin.com/in/mohammedsahalpk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://github.com/Mohsahal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:scale-110"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Checklist */}
        {/* <div className="glass-card p-10 mb-20 scroll-reveal">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-white">Offered Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Product Development",
              "Soft Skill Training",
              "IT Training",
              "Innovation & Entrepreneurship",
              "Internship & Live Projects",
              "Training & Placements",
              "Paid Certification Courses",
              "Intensive Boot Camps",
              "Expert Consultancy"
            ].map((service, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10 group">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center transition-colors group-hover:bg-green-500">
                  <CheckCircle className="h-3 w-3 text-green-400 group-hover:text-white" />
                </div>
                <span className="text-gray-300 font-semibold group-hover:text-white transition-colors">{service}</span>
              </div>
            ))}
          </div>
        </div> */}

      </div>
    </div>
  );
}

export default AboutPage;
