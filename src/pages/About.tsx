import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStorage } from '../context/StorageContext';
import { Heart, Target, Zap, Mail, Phone, MapPin, User } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export default function About() {
  const storage = useStorage();
  const [showTeam, setShowTeam] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Medical Advisor & Co-Founder',
      description: 'Board-certified physician with 15+ years of experience in preventive medicine and wellness.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
    },
    {
      name: 'Alex Chen',
      role: 'AI Engineer & Co-Founder',
      description: 'ML specialist focused on healthcare AI with expertise in natural language processing and medical data analysis.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    },
    {
      name: 'Dr. Priya Patel',
      role: 'Nutrition & Wellness Expert',
      description: 'Certified nutritionist and yoga instructor specializing in holistic health approaches.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
    },
    {
      name: 'Michael Brown',
      role: 'Full Stack Developer',
      description: 'Software engineer passionate about creating accessible healthcare technology solutions.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Store contact submission in storage
    const contacts = JSON.parse(storage.getItem('contactSubmissions') || '[]');
    contacts.push({
      ...contactForm,
      date: new Date().toISOString()
    });
    storage.setItem('contactSubmissions', JSON.stringify(contacts));
    
    toast.success('Thank you for reaching out! We\'ll get back to you soon.');
    setContactForm({ name: '', email: '', message: '' });
    setShowContact(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-1 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-gray-900 dark:text-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Health Analyzer</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            We're on a mission to make quality health insights accessible to everyone through the power of AI
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800"
                  alt="Healthcare team"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-gray-900 dark:text-white">
                What We Do
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Health Analyzer is an AI-powered health and wellness platform that provides comprehensive health analysis based on your symptoms. Our advanced AI technology analyzes your input and generates detailed reports with personalized recommendations.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We combine modern medical knowledge with holistic wellness approaches including nutrition, yoga, exercise, and natural remedies to provide you with a complete health solution.
              </p>

              <div className="grid md:grid-cols-3 gap-6 pt-6">
                <div className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-gray-900 dark:text-white mb-2">Holistic Care</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Complete wellness approach</p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <Zap className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
                  <h3 className="text-gray-900 dark:text-white mb-2">AI-Powered</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Advanced technology</p>
                </div>

                <div className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <Target className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-gray-900 dark:text-white mb-2">Personalized</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Tailored to your needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              What We Provide
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive health solutions to help you achieve optimal wellness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Detailed Health Reports',
              'Symptom Analysis',
              'Disease Prevention Tips',
              'Recommended Medicines',
              'Yoga & Exercise Plans',
              'Personalized Diet Plans',
              'Natural Remedies',
              'Progress Tracking',
              'BMI Calculator',
              'Health Score Monitoring',
              '24/7 AI Chatbot',
              'PDF Report Downloads'
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => {
              setShowTeam(true);
              setShowContact(false);
            }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Meet Our Team
          </button>
          <button
            onClick={() => {
              setShowContact(true);
              setShowTeam(false);
            }}
            className="px-8 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-emerald-500 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Contact Us
          </button>
        </div>
      </section>

      {/* Team Section */}
      {showTeam && (
        <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 dark:text-white mb-4">
                Meet Our Team
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Passionate experts dedicated to your health and wellness
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="group rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-gray-900 dark:text-white mb-2">{member.name}</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 mb-3">{member.role}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {showContact && (
        <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 dark:text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We'd love to hear from you
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">support@healthanalyzer.com</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white">Phone</h3>
                      <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white">Address</h3>
                      <p className="text-gray-600 dark:text-gray-300">123 Health Street, Wellness City, HC 12345</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-2xl transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  HEALWELL AI
                </span>
              </div>
              <p className="text-gray-400">
                AI-powered health and wellness analysis platform for comprehensive health insights.
              </p>
            </div>
            
            <div>
              <h3 className="mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link to="/feedback" className="hover:text-emerald-400 transition-colors">Feedback</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI Health Analysis</li>
                <li>Diet Planning</li>
                <li>Progress Tracking</li>
                <li>BMI Calculator</li>
                <li>24/7 AI Chatbot</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 HEALWELL AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
