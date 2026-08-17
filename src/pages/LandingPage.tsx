
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { User, Briefcase, Building, Play, ArrowRight, Check, Star } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRoleSelect = (role: string) => {
    navigate(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Good Tenants</span>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/auth")}
          className="rounded-full border-2 hover:shadow-lg transition-all duration-300"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-16 max-w-7xl mx-auto">
        <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Rental Match
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect pre-screened tenants with quality housing. 
            Skip the endless searching and get invited to your next home.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Join Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/summer")}
              className="rounded-full border-2 px-8 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Play className="mr-2 w-5 h-5" />
              See How It Works
            </Button>
          </div>

          {/* Floating Animation Elements */}
          <div className="relative">
            <div className={`absolute -top-20 -left-20 w-32 h-32 bg-blue-100 rounded-full opacity-50 transition-all duration-2000 ${isVisible ? 'animate-bounce' : ''}`} style={{animationDelay: '0.5s'}}></div>
            <div className={`absolute -top-10 -right-32 w-24 h-24 bg-indigo-100 rounded-full opacity-40 transition-all duration-2000 ${isVisible ? 'animate-bounce' : ''}`} style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Three simple steps to find your perfect rental match</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: User,
                title: "Get Ready",
                description: "Create your profile and get pre-screened with minimal information",
                delay: "0.2s"
              },
              {
                icon: Briefcase,
                title: "Get Found", 
                description: "Browse available properties and let agents find you",
                delay: "0.4s"
              },
              {
                icon: Building,
                title: "Get Housed",
                description: "Receive direct invitations and secure your next home faster",
                delay: "0.6s"
              }
            ].map((step, index) => (
              <div 
                key={index}
                className={`text-center group transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{transitionDelay: step.delay}}
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Professionals</h2>
            <p className="text-lg text-gray-600">Real estate agents and property managers across Southern California</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Real Estate Agent",
                content: "Good Tenants has revolutionized how I find qualified renters. I've placed 15+ tenants in the last 6 months!",
                rating: 5
              },
              {
                name: "Mike Chen", 
                role: "Property Manager",
                content: "The pre-screening process saves me hours. I only see tenants who are actually qualified and ready to move.",
                rating: 5
              },
              {
                name: "Lisa Rodriguez",
                role: "Landlord",
                content: "Finally, a platform that brings quality tenants to me instead of me having to search through endless applications.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Animation Block */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">See Good Tenants in Action</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 shadow-lg">
              <div className="aspect-video bg-white rounded-xl shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">Interactive Demo Coming Soon</p>
                  <p className="text-sm text-gray-500 mt-2">Watch how tenants and agents connect seamlessly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Become a Good Tenant</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of renters who get invited to quality properties instead of competing with hundreds of applications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="rounded-full bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Profile - It's Free
            </Button>
          </div>

          {/* Trust Icons */}
          <div className="flex items-center justify-center space-x-8 opacity-75">
            {[
              { icon: Check, text: "Verified Profiles" },
              { icon: Building, text: "Quality Properties" },
              { icon: User, text: "Trusted Network" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Good Tenants</span>
            </div>
            <p className="text-gray-400 mb-4">&copy; {new Date().getFullYear()} Good Tenants Services, Inc. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
