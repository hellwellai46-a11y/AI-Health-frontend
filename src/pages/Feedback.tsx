import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useStorage } from '../context/StorageContext';
import { MessageSquare, Send, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function Feedback() {
  const storage = useStorage();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    city: '',
    feedback: '',
    rating: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.city || !formData.feedback) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!formData.rating) {
      toast.error('Please provide a rating');
      return;
    }

    // Store feedback in storage
    const feedbacks = JSON.parse(storage.getItem('feedbacks') || '[]');
    feedbacks.push({
      ...formData,
      date: new Date().toISOString(),
      id: Date.now().toString()
    });
    storage.setItem('feedbacks', JSON.stringify(feedbacks));

    toast.success('Thank you for your feedback! We appreciate your input.');
    setFormData({ name: '', age: '', city: '', feedback: '', rating: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>We Value Your Opinion</span>
            </div>
            
            <h1 className="text-gray-900 dark:text-white mb-4">
              Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Feedback</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your feedback helps us improve our services and provide better health solutions to everyone.
            </p>
          </div>

          {/* Feedback Form */}
          <div className="p-8 md:p-12 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-3">
                  Rate Your Experience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Age and City */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Your age"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Your city"
                  />
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Share your thoughts, suggestions, or experiences with our platform..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                Submit Feedback
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">Share Ideas</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Suggest new features or improvements
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">Rate Experience</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Help us understand what works
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">Quick Response</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We review all feedback regularly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
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
