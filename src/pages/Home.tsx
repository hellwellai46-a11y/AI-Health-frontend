import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import NutritionCalculator from '../components/NutritionCalculator';
import {
  Brain,
  Heart,
  TrendingUp,
  Shield,
  Sparkles,
  FileText,
  Apple,
  Stethoscope,
  UtensilsCrossed,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNutritionCalculator, setShowNutritionCalculator] = useState(false);

  const handleStartAssessment = () => {
    if (user) {
      navigate('/analyze');
    } else {
      navigate('/login');
    }
  };

  const handleOpenNutritionCalculator = () => {
    setShowNutritionCalculator(true);
  };

  const services = [
    {
      icon: Brain,
      title: 'AI Health Analysis',
      description:
        'Get comprehensive health reports powered by advanced AI technology that analyzes your symptoms and provides detailed insights.',
    },
    {
      icon: FileText,
      title: 'Detailed Reports',
      description:
        'Receive detailed reports with symptoms analysis, possible causes, prevention tips, recommended medicines, yoga, exercises, and natural remedies.',
    },
    {
      icon: Apple,
      title: 'Personalized Diet Plans',
      description:
        'Get weekly diet plans customized to your health condition with daily exercises, medicines, and meal recommendations to achieve optimal results.',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description:
        'Track your daily progress, monitor your health score improvements, and get personalized suggestions for better health outcomes.',
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      description:
        'Complete wellness approach combining modern medicine with yoga, natural remedies, and lifestyle modifications for sustainable health.',
    },
    {
      icon: Stethoscope,
      title: 'BMI & Health Metrics',
      description:
        'Calculate your BMI, track past reports, monitor average health scores, and maintain a complete health history dashboard.',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground
        particleCount={60}
        parallaxIntensity={0.3}
        enableParticles={true}
        enableGradient={true}
      />
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center space-y-6">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Health Analysis Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-4xl">
            Transform Your Health with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 underline underline-offset-4">
              AI-Powered
            </span>{' '}
            Wellness Analysis
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
            Enter your symptoms and receive comprehensive AI-generated health
            reports with personalized recommendations for diet, yoga, lifestyle
            changes, and medical remedies — all in one place.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button
              onClick={handleStartAssessment}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
            >
              Start Free Assessment
            </button>

            <Link
              to="/chatbot"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  navigate('/login');
                }
              }}
              className="px-8 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors font-semibold shadow-lg"
            >
              Try AI Chatbot
            </Link>
          </div>

          {/* Trusted Users */}
          <div className="flex flex-col items-center justify-center mt-10 space-y-2">
            
            <div className="mt-8 fade-in-delay-900">
              <button
                onClick={handleOpenNutritionCalculator}
                className="group relative px-8 py-6 rounded-xl text-white hover:scale-[1.05] transition-all duration-300 font-bold shadow-xl z-20 flex items-center justify-center gap-4 overflow-hidden animate-pulse-glow"
                style={{
                  padding: '15px',
                  background: 'linear-gradient(90deg, #059669, #14b8a6, #06b6d4, #14b8a6, #059669)',
                  backgroundSize: '150% 100%',
                  animation: 'gradient-shift 8s ease infinite, pulse-glow 2s ease-in-out infinite',
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-500" />
                {/* Soft green/white shadow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/30 via-teal-300/30 to-cyan-400/30 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse-glow" />
                {/* Glowing effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-25 transition-opacity duration-300 blur-xl" />
                {/* Left Icon - Nutrition/Food */}
                <div className="relative z-10 flex items-center justify-center">
                  <UtensilsCrossed
                    className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300 animate-icon-bounce"
                    style={{ animationDelay: '0s', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}
                  />
                </div>
                {/* Text Content */}
                <div className="relative z-10 text-center">
                  <div
                    className="text-lg font-bold tracking-tight group-hover:scale-105 transition-transform duration-300 text-white"
                    style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
                  >
                    Check your Nutrition
                  </div>
                  <div
                    className="text-xs font-normal text-white/90 mt-0.5 group-hover:text-white transition-colors duration-300"
                    style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}
                  >
                    Powered by AI
                  </div>
                </div>
                {/* Right Icon - Apple/Heart */}
                <div className="relative z-10 flex items-center justify-center">
                  <Apple
                    className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300 animate-icon-bounce"
                    style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }}
                  />
                </div>
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/50 group-hover:border-emerald-300/80 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div>
                <div className="flex items-center gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Trusted by 10,000+ users</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      

      {/* ===================== SERVICES SECTION ===================== */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Our Services & Features
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive health analysis and wellness solutions powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative text-center space-y-6">
              <h2 className="text-white">Ready to Take Control of Your Health?</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Join thousands of users who are improving their health with
                AI-powered insights
              </p>
              <button
                onClick={handleStartAssessment}
                className="inline-block px-8 py-4 rounded-xl bg-white text-emerald-600 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Start Your Assessment Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== DISCLAIMER ===================== */}
      <section className="py-8 px-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-yellow-900 dark:text-yellow-200">
                <strong>Medical Disclaimer:</strong> This AI-powered tool is
                designed for informational and educational purposes only. It is
                not intended to be a substitute for professional medical advice,
                diagnosis, or treatment. Always seek the advice of a qualified
                healthcare provider with any questions you may have regarding a
                medical condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="py-12 px-4 bg-gray-900 text-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  HEALWELL AI
                </span>
              </div>
              <p className="text-gray-400">
                AI-powered health and wellness analysis platform for
                comprehensive health insights.
              </p>
            </div>

            <div>
              <h3 className="mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-emerald-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/feedback"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Feedback
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      to="/dashboard"
                      className="hover:text-emerald-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
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

      {/* ===================== NUTRITION CALCULATOR ===================== */}
      <NutritionCalculator
        isOpen={showNutritionCalculator}
        onOpenChange={setShowNutritionCalculator}
      />
    </div>
  );
}
