import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  Target, 
  CheckCircle,
  Lightbulb,
  Code,
  Database,
  Star,
  GraduationCap,
  Briefcase,
  Rocket
} from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-6">
              <img src="/images/logo.png" alt="BravyNex Logo" className="w-25 h-16 object-contain" />
            </div>
            {/* <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              About BravyNex Engineering
            </h1> */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Empowering learners with industry-relevant skills through expert-led courses, 
              hands-on projects, and personalized support. Your success is our mission.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">500+</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Students Trained</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">4.9/5</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Average Rating</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">15+</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Years Experience</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">50+</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Courses</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Logos Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 lg:flex-shrink-0">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <img 
                  src="/images/msme.png" 
                  alt="MSME Logo" 
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <img 
                  src="/images/nsdc.png" 
                  alt="NSDC Logo" 
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex-1 text-left pl-0 lg:pl-8">
              <p className="text-base text-gray-900 leading-relaxed mb-4">
                Registered under <span className="font-bold">MICRO, SMALL AND MEDIUM ENTERPRISES (MSME) and National Skill Development Corporation (NSDC)</span>,we design impactful courses that blend industry expertise with innovation to empower learners. Our content remains relevant and insightful, helping individuals achieve their goals, make meaningful progress in their careers, and contribute to a skilled workforce. Additionally, we provide internship opportunities that offer hands-on experience, bridging the gap between theory and practice to prepare learners for real-world challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Trainers Section - Black Background */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content */}
            <div className="flex-1 text-white pr-0 lg:pr-8">
              <p className="text-base leading-relaxed">
                Our trainers are industry experts with <span className="font-bold">over 15 years of practical experience</span> and a passion for teaching. They bring in-depth knowledge, real-world insights, and engaging teaching methods to every course. Dedicated to your success, they provide guidance, support, and inspiration, ensuring a fulfilling and effective learning experience for all our students.
              </p>
            </div>
            
            {/* Image */}
            <div className="lg:flex-shrink-0">
              <div className="w-full max-w-[280px] lg:max-w-[320px]">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop" 
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
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop" 
                  alt="Successful Students" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex-1 pl-0 lg:pl-8">
              <p className="text-base text-gray-900 leading-relaxed">
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
              <p className="text-base leading-relaxed">
                We offer a variety of services to support growth and success. Our Product Development brings innovative ideas to life, while Soft Skill Training enhances communication and leadership abilities. With IT Training, we ensure you're equipped with the latest tech knowledge. Our focus on Innovation and Entrepreneurship empowers creative ventures, and <span className="font-bold">our Consultancy provides expert advice to help you achieve your goals</span>.
              </p>
            </div>
            
            {/* Image */}
            <div className="lg:flex-shrink-0">
              <div className="w-full max-w-[280px] lg:max-w-[320px]">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" 
                  alt="Team Collaboration" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Delivering excellence through expert-led training and comprehensive support for your success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-gray-700" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">What We Deliver</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">Industry-relevant curriculum</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">Hands-on project experience</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">Expert instructor guidance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700">Career support and mentorship</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-700 to-gray-600 text-white border-0 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Expert Trainers</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-100 leading-relaxed mb-6">
                  Our trainers bring 15+ years of industry experience and a passion for teaching. 
                  They provide guidance, support, and inspiration for your learning journey.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white/10 rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">15+</div>
                    <div className="text-xs sm:text-sm text-gray-200">Years Experience</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">500+</div>
                    <div className="text-xs sm:text-sm text-gray-200">Students Trained</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Services</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Comprehensive services to support your growth and success in technology and beyond.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Product Development</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Bring innovative ideas to life with comprehensive development services.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Soft Skill Training</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Enhance communication and leadership abilities for professional growth.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">IT Training</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Stay equipped with the latest technology knowledge and skills.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Innovation & Entrepreneurship</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Foster creative thinking and business development skills.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Consultancy</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Expert advice and guidance tailored to your specific needs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Internship Opportunities</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Hands-on experience that bridges theory and practice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Student Success</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Our students appreciate the flexibility, expert-led courses, and practical knowledge they gain.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">500+ Students</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Successfully trained and empowered in their learning journeys.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">High Satisfaction</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Students love the flexibility and personalized support they receive.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Career Growth</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Many have boosted their careers and explored new passions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
