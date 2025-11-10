import {
  Building2,
  Target,
  Eye,
  Lightbulb,
  CheckCircle2,
  Award,
} from "lucide-react";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
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
                <span className="font-semibold">Bravynex</span> is a
                forward-thinking product and service-based company dedicated to
                delivering quality solutions that meet customer needs.
              </p>
              <p>
                With a focus on innovation, reliability, and customer
                satisfaction, we provide a range of products and services that
                help businesses grow and succeed.
              </p>
              <p>
                Our company is officially registered under the Ministry of
                Micro, Small and Medium Enterprises (MSME), Government of India.
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
                To empower individuals with the skills and knowledge needed to
                excel in the tech industry by providing specialized training
                programs.
              </p>
              <p>
                While our hardware products support industry and innovation in
                the non-IT space, our software services focus on upskilling
                talent and helping them secure their dream jobs in the IT
                sector.
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
            Registered under MICRO, SMALL AND MEDIUM ENTERPRISES (MSME) and
            National Skill Development Corporation (NSDC), we design impactful
            courses that blend industry expertise with innovation to empower
            learners. Our curriculum remains dynamic and inspiring, helping
            individuals achieve their goals, make meaningful progress in their
            careers, and contribute to a skilled workforce.
          </p>
          <p className="text-gray-700 leading-relaxed mb-8">
            Additionally, we provide internship opportunities that offer
            hands-on experience, bridging the gap between theory and practice to
            prepare learners for real-world challenges. Our affiliation with
            Visveswaraya Technological University (VTU), one of India's largest
            technological universities, provides academic credibility,
            internship.
          </p>

          {/* Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mt-10">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/National_Skill_Development_Corporation_logo.png/220px-National_Skill_Development_Corporation_logo.png"
                  alt="NSDC Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">NSDC</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img
                  src="https://msme.gov.in/themes/msme/images/logo.png"
                  alt="MSME Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">MSME</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img
                  src="https://vtu.ac.in/wp-content/uploads/2020/02/VTU-LOGO.png"
                  alt="VTU Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">VTU</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img
                  src="https://www.skillindia.gov.in/content/dam/logos/skill-india-logo.png"
                  alt="Skill India Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Skill India
              </p>
            </div>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Vision */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-600" />
              Vision
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To be a global leader in delivering innovative products and
              reliable services that empower businesses and enrich lives.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-xl p-8 border-l-4 border-purple-600">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-purple-600" />
              Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to create exceptional value for our customers
              through high-quality products, personalized services, and
              cutting-edge solutions. We strive to foster long-term
              partnerships, drive continuous innovation, and uphold integrity in
              everything we do.
            </p>
          </div>
        </div>

        {/* Our Goals Section */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-10 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Target className="h-8 w-8 text-yellow-600" />
            Our Goals
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our goals are to deliver high-quality solutions that meet customer
            needs, enhance satisfaction through reliable support and service,
            and drive innovation to support continuous growth and success.
          </p>
        </div>

        {/* Offered Services Section */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            Offered Services
          </h2>
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
              "Consultancy",
            ].map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
