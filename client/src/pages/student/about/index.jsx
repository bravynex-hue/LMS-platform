import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2,
  Target, 
  Eye,
  CheckCircle,
  Lightbulb,
  Award
} from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">About the Company</h1>
          <div className="w-24 h-1 bg-yellow-500"></div>
        </div>
      </div>
      

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* About the Company Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-yellow-500" />
              About the Company
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <span className="font-semibold">Bravynex</span> is a forward-thinking product and service-based company dedicated to delivering quality solutions that meet customer needs.
              </p>
              <p>
                With a focus on innovation, reliability, and customer satisfaction, we provide a range of products and services that help businesses grow and succeed.
              </p>
              <p>
                Our company is officially registered under the Ministry of Micro, Small and Medium Enterprises (MSME), Government of India.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Target className="h-8 w-8 text-yellow-500" />
              Objectives
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                To empower individuals with the skills and knowledge needed to excel in the tech industry by providing specialized training programs.
              </p>
              <p>
                While our hardware products support industry and innovation in the non-IT space, our software services focus on upskilling talent and helping them secure their dream jobs in the IT sector.
              </p>
            </div>
          </div>
        </div>

        {/* Registered Under Section with Logos */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Registered Under
          </h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Registered under MICRO, SMALL AND MEDIUM ENTERPRISES (MSME) and National Skill Development Corporation (NSDC), we design impactful courses that blend industry expertise with innovation to empower learners. Our curriculum remains dynamic and inspiring, helping individuals achieve their goals, make meaningful progress in their careers, and contribute to a skilled workforce.
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            Additionally, we provide internship opportunities that offer hands-on experience, bridging the gap between theory and practice to prepare learners for real-world challenges. Our affiliation with Visveswaraya Technological University (VTU), one of India's largest technological universities, provides academic credibility, internship.
          </p>
          
          {/* Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mt-10">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src="/images/nsdc.png" 
                  alt="NSDC Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">NSDC</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src="/images/msme.png" 
                  alt="MSME Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">MSME</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src="/images/vtu.png" 
                  alt="VTU Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">VTU</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src="/images/skill-india.png" 
                  alt="Skill India Logo" 
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">Skill India</p>
            </div>
          </div>
        </div>

      {/* Expert Trainers Section - Black Background */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="flex-1 text-white pr-0 lg:pr-8">
              <p className="text-base leading-relaxed text-justify">
                Our trainers are industry experts with <span className="font-bold">over 15 years of practical experience</span> and a passion for teaching. They bring in-depth knowledge, real-world insights, and engaging teaching methods to every course. Dedicated to your success, they provide guidance, support, and inspiration, ensuring a fulfilling and effective learning experience for all our students.
              </p>
            </div>
            
            {/* Image */}
            <div className="lg:flex-shrink-0">
              <div className="w-full max-w-[280px] lg:max-w-[320px]">
                <img 
                  src="/images/pic4.webp" 
                  alt="Expert Trainer" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Success Stories Section - White Background */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Image */}
            <div className="lg:flex-shrink-0">
              <div className="w-full max-w-[280px] lg:max-w-[320px]">
                <img 
                  src="/images/pic2.webp" 
                  alt="Successful Students" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex-1 pl-0 lg:pl-8">
              <p className="text-base text-gray-900 leading-relaxed text-justify">
                Our students love the flexibility, expert-led courses, and practical knowledge they gain. They appreciate the interactive learning experience and the personalized support they receive. Many have shared how our courses helped them achieve their goals, boost their careers, or explore new passions. Their success stories inspire us to keep delivering excellence! With pride, <span className="font-bold">we can say that we have successfully trained over 500 students</span>, empowering them to make meaningful progress in their journeys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section - Black Background */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="flex-1 text-white pr-0 lg:pr-8">
              <p className="text-base leading-relaxed text-justify">
                We offer a variety of services to support growth and success. Our Product Development brings innovative ideas to life, while Soft Skill Training enhances communication and leadership abilities. With IT Training, we ensure you're equipped with the latest tech knowledge. Our focus on Innovation and Entrepreneurship empowers creative ventures, and <span className="font-bold">our Consultancy provides expert advice to help you achieve your goals</span>.
              </p>
            </div>
            
            {/* Image */}
            <div className="lg:flex-shrink-0">
              <div className="w-full max-w-[280px] lg:max-w-[320px]">
                <img 
                  src="/images/pic5.webp" 
                  alt="Team Collaboration" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Vision & Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 mt-10">
          {/* Vision */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To be a global leader in delivering innovative products and reliable services that empower businesses and enrich lives.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to create exceptional value for our customers through high-quality products, personalized services, and cutting-edge solutions. We strive to foster long-term partnerships, drive continuous innovation, and uphold integrity in everything we do.
            </p>
          </div>
        </div>

        {/* Our Goals Section */}
        <div className="bg-white rounded-lg shadow-lg p-10 mb-20 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Goals</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Our goals are to deliver high-quality solutions that meet customer needs, enhance satisfaction through reliable support and service, and drive innovation to support continuous growth and success.
          </p>
        </div>

     
        <div className="bg-white rounded-lg shadow-lg p-10 mb-20 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Offered Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Product Development",
              "Soft Skill Training",
              "IT Training",
              "Innovation and Entrepreneurship Training",
              "Internship and Projects",
              "Training and Placements",
              "Paid Certifications Courses",
              "Boot Camps",
              "Consultancy"
            ].map((service, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>

    
      </div>
    </div>
  );
}

export default AboutPage;
