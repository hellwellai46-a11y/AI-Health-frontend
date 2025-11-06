import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';
import { healthReportAPI, reminderAPI, weeklyPlannerAPI } from '../services/api';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import EmergencyHelp from '../components/EmergencyHelp';
import {
  Activity,
  TrendingUp,
  FileText,
  Plus,
  Calendar,
  Heart,
  User,
  Scale,
  Eye,
  Calculator,
  Bell,
  Clock,
  Link as LinkIcon,
  Copy,
  Square,
  Thermometer,
  Droplet,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

interface HealthReport {
  _id?: string;
  id?: string;
  userId: string;
  date: string;
  healthScore: number;
  summary?: string;
  symptoms?: string[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const storage = useStorage();
  const navigate = useNavigate();
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<any[]>([]);
  const [healthTip, setHealthTip] = useState('');
  const [showBMI, setShowBMI] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string; color: string } | null>(null);
  const [avgHealthScore, setAvgHealthScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [completedRemindersCount, setCompletedRemindersCount] = useState(0);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  
  // Live Health Monitoring state
  const [liveLink, setLiveLink] = useState<string | null>(null);
  const [linkExpiry, setLinkExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  
  // Mock health readings (in real app, these would come from sensors/API)
  const [healthReadings, setHealthReadings] = useState({
    heartRate: 85,
    bloodPressure: { systolic: 118, diastolic: 78 },
    temperature: 36.8,
    oxygenLevel: 97
  });
  
  // Chart data for pulse visualization
  const [pulseData, setPulseData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 85 + Math.sin(i * 0.5) * 5
    }))
  );

  useEffect(() => {
    if (user) {
      fetchUserData();
    }

    // Random health tip
    const tips = [
      '💧 Drink at least 8 glasses of water daily for optimal health',
      '🧘 Practice 10 minutes of meditation daily to reduce stress',
      '🥗 Include more leafy greens in your diet',
      '😴 Aim for 7-9 hours of quality sleep each night',
      '🚶 Take a 30-minute walk every day',
      '🍎 Eat a variety of colorful fruits and vegetables',
      '🧠 Take regular breaks from screen time',
      '💪 Strength training twice a week can improve overall health',
      '🥤 Limit sugary drinks and opt for herbal teas',
      '🌞 Get 15 minutes of sunlight daily for Vitamin D'
    ];
    setHealthTip(tips[Math.floor(Math.random() * tips.length)]);
    
    // Update pulse data animation
    const pulseInterval = setInterval(() => {
      setPulseData(prev => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1].value;
        newData.push({
          time: prev.length,
          value: lastValue + (Math.random() - 0.5) * 3
        });
        return newData;
      });
    }, 1000);
    
    return () => clearInterval(pulseInterval);
  }, [user]);
  
  // Update time remaining for link expiry
  useEffect(() => {
    if (!linkExpiry) return;
    
    const updateTimer = () => {
      const now = new Date();
      const diff = linkExpiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Expired');
        setLiveLink(null);
        setIsSharing(false);
        setLinkExpiry(null);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(timerInterval);
  }, [linkExpiry]);
  
  // Simulate health readings updates
  useEffect(() => {
    if (!isSharing) return;
    
    const healthInterval = setInterval(() => {
      setHealthReadings(prev => ({
        heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
        bloodPressure: {
          systolic: Math.max(110, Math.min(130, prev.bloodPressure.systolic + (Math.random() - 0.5) * 4)),
          diastolic: Math.max(70, Math.min(85, prev.bloodPressure.diastolic + (Math.random() - 0.5) * 3))
        },
        temperature: Math.max(36.0, Math.min(37.5, prev.temperature + (Math.random() - 0.5) * 0.2)),
        oxygenLevel: Math.max(95, Math.min(100, prev.oxygenLevel + (Math.random() - 0.5) * 1))
      }));
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(healthInterval);
  }, [isSharing]);
  
  const generateLiveLink = () => {
    const linkId = Math.random().toString(36).substring(2, 9);
    
    // Get base URL - works in both development and production
    // window.location.origin automatically gets the current domain
    // Development: http://localhost:3000
    // Production: https://your-domain.vercel.app (or your deployed domain)
    // Optional: Can override with VITE_FRONTEND_URL env variable if needed
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/live/${linkId}`;//
    
    setLiveLink(link);
    setIsSharing(true);
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    setLinkExpiry(expiry);
    
    toast.success('Live link generated! Share it with your doctor.');
    console.log('Generated live link:', link); // For debugging
  };
  
  const copyLink = () => {
    if (liveLink) {
      navigator.clipboard.writeText(liveLink);
      toast.success('Link copied to clipboard!');
    }
  };
  
  const stopSharing = () => {
    setLiveLink(null);
    setIsSharing(false);
    setLinkExpiry(null);
    toast.info('Live sharing stopped.');
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch reports
      const reportsResponse = await healthReportAPI.getReportsByUser(user.id);
      if (reportsResponse.success && reportsResponse.data) {
        setReports(reportsResponse.data);
      }

      // Fetch average health score
      const scoreResponse = await healthReportAPI.getAverageHealthScore(user.id);
      if (scoreResponse.success) {
        setAvgHealthScore(scoreResponse.averageScore || 0);
      }

      // Fetch weekly plans from backend
      try {
        const plansResponse = await weeklyPlannerAPI.getPlannersByUser(user.id);
        if (plansResponse.success && plansResponse.data) {
          setWeeklyPlans(plansResponse.data);
        }
      } catch (error) {
        console.error('Error fetching weekly plans:', error);
        // Fallback to storage if backend fails
        const plans = JSON.parse(storage.getItem('weeklyPlans') || '[]');
        const userPlans = plans.filter((p: any) => p.userId === user.id);
        setWeeklyPlans(userPlans);
      }

            // Fetch reminders
            try {
              // Fetch all reminders (not just active) to get completed count
              const allRemindersResponse = await reminderAPI.getUserReminders(user.id);
              if (allRemindersResponse.success && allRemindersResponse.data) {
                // Calculate completed count - include all reminders with isCompleted = true
                const completedCount = allRemindersResponse.data.filter((r: any) => r.isCompleted).length;
                setCompletedRemindersCount(completedCount);

                // Filter for active upcoming reminders
                const now = new Date();
                const reminders = allRemindersResponse.data.filter((r: any) => {
                  if (!r.isActive) return false;
                  const nextReminder = new Date(r.nextReminder);
                  // Show reminder if:
                  // - It's upcoming (nextReminder > now) OR
                  // - It's recurring and was completed but next reminder time has passed
                  const isUpcoming = nextReminder > now;
                  const isRecurringCompleted = r.frequency !== 'once' && r.isCompleted && r.completedAt && 
                    new Date(r.completedAt) < now && nextReminder <= now;
                  return isUpcoming || isRecurringCompleted;
                }).sort((a: any, b: any) => {
                  // Sort by next reminder time, but put non-completed first
                  if (a.isCompleted !== b.isCompleted) {
                    return a.isCompleted ? 1 : -1;
                  }
                  return new Date(a.nextReminder).getTime() - new Date(b.nextReminder).getTime();
                }).slice(0, 5); // Get top 5 upcoming
                setUpcomingReminders(reminders);
              }
            } catch (error) {
              console.error('Error fetching reminders:', error);
            }
          } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
          } finally {
            setLoading(false);
          }
        };

  // Chart data
  const healthScoreData = reports.slice(0, 10).reverse().map((r, index) => ({
    name: `R${index + 1}`,
    score: r.healthScore,
    date: new Date(r.date).toLocaleDateString()
  }));

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // convert cm to m
    const w = parseFloat(weight);

    if (!h || !w || h <= 0 || w <= 0) {
      return;
    }

    const bmi = w / (h * h);
    let category = '';
    let color = '';

    if (bmi < 16) {
      category = 'Severe Underweight';
      color = 'text-red-600 dark:text-red-400';
    } else if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-orange-600 dark:text-orange-400';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = 'text-emerald-600 dark:text-emerald-400';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-600 dark:text-yellow-400';
    } else {
      category = 'Obese';
      color = 'text-red-600 dark:text-red-400';
    }

    setBmiResult({ bmi: parseFloat(bmi.toFixed(1)), category, color });
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground 
        particleCount={40}
        parallaxIntensity={0.2}
        enableParticles={true}
        enableGradient={true}
      />
      <Navbar />

      <div className="pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
            <h1 className="text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here's your health overview and progress
            </p>
            </div>
            <EmergencyHelp />
          </div>

          {/* Health Tip */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Daily Health Tip</p>
                <p className="text-white">{healthTip}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Profile Picture Card */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mb-3">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{user?.email}</p>
                <Link
                  to="/profile"
                  className="mt-3 text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Average Health Score */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white">Avg Health Score</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{avgHealthScore}/100</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {avgHealthScore >= 80 ? 'Excellent!' : avgHealthScore >= 60 ? 'Good' : 'Needs improvement'}
              </p>
            </div>

            {/* Past Reports */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white">Total Reports</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{reports.length}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Health assessments</p>
            </div>

            {/* Completed Reminders */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white">Completed Reminders</h3>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{completedRemindersCount}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Reminders completed</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Health Score Progress Chart */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 dark:text-white">Health Score Progress</h3>
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              {reports.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={healthScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No data yet. Start your first assessment!
                </div>
              )}
            </div>

            {/* BMI Calculator */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white">BMI Calculator</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateBMI}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
                >
                  Calculate BMI
                </button>

                {bmiResult && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {bmiResult.bmi}
                      </div>
                      <div className={`text-lg font-semibold ${bmiResult.color}`}>
                        {bmiResult.category}
                      </div>
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>• Underweight: BMI {'<'} 18.5</p>
                      <p>• Normal: BMI 18.5 - 24.9</p>
                      <p>• Overweight: BMI 25 - 29.9</p>
                      <p>• Obese: BMI {'≥'} 30</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Health Monitoring */}
          <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-gray-900 dark:text-white">Live Health Monitoring</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 text-xs bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-lg z-10">
                  Anyone with this link can view your live health status.
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Share real-time vitals with your doctor.
            </p>

            {!liveLink ? (
              <div className="text-center py-8">
                <button
                  onClick={generateLiveLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
                >
                  <LinkIcon className="w-5 h-5" />
                  Generate Live Link
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Link Display */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <code className="flex-1 text-sm text-gray-900 dark:text-gray-100 break-all">
                      {liveLink}
                    </code>
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={stopSharing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                    >
                      <Square className="w-4 h-4" />
                      Stop Sharing
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Expires in: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{timeRemaining}</span>
                  </div>
                </div>

                {/* Health Readings Panel */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Heart Rate */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Heart Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(healthReadings.heartRate)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">bpm</div>
                  </div>

                  {/* Blood Pressure */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Blood Pressure</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(healthReadings.bloodPressure.systolic)}/{Math.round(healthReadings.bloodPressure.diastolic)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">mmHg</div>
                  </div>

                  {/* Temperature */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {healthReadings.temperature.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">°C</div>
                  </div>

                  {/* Oxygen Level */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Oxygen Level</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(healthReadings.oxygenLevel)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">SpO2</div>
                  </div>
                </div>

                {/* Pulse Chart */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Pulse</span>
                  </div>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={pulseData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Past Reports History */}
          <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 dark:text-white">Past Reports History</h3>
              <div className="flex items-center gap-3">
                {reports.length > 3 && (
                  <button
                    onClick={() => setShowAllReports(!showAllReports)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-colors text-sm"
                  >
                    {showAllReports ? 'Show Less' : 'View All'}
                  </button>
                )}
                <Link
                  to="/analyze"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Assessment
                </Link>
              </div>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-3">
                {(showAllReports ? reports : reports.slice(0, 3)).map((report) => (
                  <div
                    key={report._id || report.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                        {report.healthScore}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white">{new Date(report.date).toLocaleDateString()}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {report.symptoms?.length || 0} symptoms detected
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/report/${report._id || report.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Report
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No reports yet</p>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Assessment
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 dark:text-white">Upcoming Reminders</h3>
              <Link
                to="/reminders"
                className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
              >
                View All
              </Link>
            </div>

            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div
                    key={reminder._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white text-sm font-medium">{reminder.title}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(reminder.nextReminder).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">No upcoming reminders</p>
                <Link
                  to="/reminders"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Reminder
                </Link>
              </div>
            )}
          </div>

          {/* Past Weekly Plans */}
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 dark:text-white">Past Weekly Plans</h3>
              {weeklyPlans.length > 3 && (
                <button
                  onClick={() => setShowAllPlans(!showAllPlans)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-colors text-sm"
                >
                  {showAllPlans ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>

            {weeklyPlans.length > 0 ? (
              <div className="space-y-3">
                {(showAllPlans ? weeklyPlans : weeklyPlans.slice(0, 3)).map((plan) => (
                  <div
                    key={plan.id || plan._id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Week of {new Date(plan.createdDate || plan.weekStart || Date.now()).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {plan.weekPlan?.length || plan.days?.length || 0} days planned
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/planner/${plan.id || plan._id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Plan
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No weekly plans yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
