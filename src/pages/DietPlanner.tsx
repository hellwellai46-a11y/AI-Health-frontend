import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';
import { healthReportAPI, weeklyPlannerAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Apple, Dumbbell, Pill, Coffee, Sun, Moon, Download, CheckCircle, TrendingUp, Calendar as CalendarIcon, Grid, List } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface DayPlan {
  day: string;
  date?: string;
  diet: string[] | { breakfast?: string; midMorningSnack?: string; lunch?: string; eveningSnack?: string; dinner?: string; hydration?: string };
  exercises: string[];
  medicines: Array<{ name: string; note?: string }> | string[];
  notes: string;
  progress?: number;
  focusNote?: string;
}

interface WeeklyPlan {
  id?: string;
  _id?: string;
  reportId: string;
  userId: string;
  createdDate: string;
  weekPlan: DayPlan[];
}

export default function DietPlanner() {
  const { reportId, id } = useParams<{ reportId?: string; id?: string }>();
  const { user } = useAuth();
  const storage = useStorage();
  const navigate = useNavigate();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (id && user) {
      // Load existing planner by ID
      loadPlannerById(id);
    } else if (reportId && user) {
      // Generate new planner from report
      generatePlanFromReport();
    }
  }, [id, reportId, user]);

  // Load existing planner by ID
  const loadPlannerById = async (plannerId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const plannerResponse = await weeklyPlannerAPI.getPlannerById(plannerId);
      
      if (!plannerResponse.success || !plannerResponse.data) {
        toast.error('Weekly planner not found');
        navigate('/dashboard');
        return;
      }

      const planner = plannerResponse.data;
      
      // Transform backend data to match component expectations
      const transformedPlan: WeeklyPlan = {
        _id: planner._id || planner.id,
        id: planner.id || planner._id,
        reportId: planner.reportId || '', // May not have reportId
        userId: planner.userId || user.id,
        createdDate: planner.createdDate || new Date().toISOString(),
        weekPlan: planner.weekPlan?.map((day: any, index: number) => {
          // Parse date properly
          let parsedDate: Date;
          if (day.date) {
            parsedDate = day.date instanceof Date ? day.date : new Date(day.date);
          } else {
            parsedDate = new Date();
            parsedDate.setDate(parsedDate.getDate() + index);
          }
          
          return {
            day: day.day || `Day ${index + 1}`,
            date: parsedDate.toISOString(),
            diet: transformDietPlan(day.diet || day.dietPlan || {}),
            exercises: Array.isArray(day.exercises) ? day.exercises : [],
            medicines: transformMedicines(day.medicines || []),
            notes: day.notes || day.focusNote || '',
            progress: day.progress || 0,
            focusNote: day.notes || day.focusNote || ''
          };
        }) || []
      };

      setWeeklyPlan(transformedPlan);
      toast.success('Weekly planner loaded successfully');
    } catch (error: any) {
      console.error('Error loading planner:', error);
      toast.error(error.response?.data?.error || 'Failed to load weekly planner');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generatePlanFromReport = async () => {
    if (!reportId || !user) return;

    setLoading(true);
    try {
      // First, fetch the report from backend
      const reportResponse = await healthReportAPI.getReportById(reportId);
      
      if (!reportResponse.success || !reportResponse.data) {
        toast.error('Report not found');
        navigate('/dashboard');
        return;
      }

      const report = reportResponse.data;
      
      // Generate weekly planner using backend API
      const symptomsText = Array.isArray(report.symptoms) 
        ? report.symptoms.join(', ') 
        : report.symptoms || '';
      
      // Get diet preference from report
      const dietPreference = report.dietPreference || 'non-vegetarian';
      
      // Try to generate planner from backend
      try {
        const plannerResponse = await weeklyPlannerAPI.generatePlanner(
          user.id,
          symptomsText || 'Generate a weekly diet and exercise plan',
          reportId,
          {
            dietPreference: dietPreference
          }
        );

        if (plannerResponse.success && plannerResponse.data?.weeklyPlanner) {
          // Use backend-generated planner
          const backendPlanner = plannerResponse.data.weeklyPlanner;
          const transformedPlan: WeeklyPlan = {
            _id: backendPlanner._id,
            id: backendPlanner._id,
            reportId: reportId,
            userId: user.id,
            createdDate: backendPlanner.createdAt || new Date().toISOString(),
            weekPlan: backendPlanner.days?.map((day: any, index: number) => {
              // Parse date properly - handle both Date objects and ISO strings
              let parsedDate: Date;
              if (day.date) {
                parsedDate = day.date instanceof Date ? day.date : new Date(day.date);
              } else {
                parsedDate = new Date();
                parsedDate.setDate(parsedDate.getDate() + index);
              }
              
              return {
                day: day.day || `Day ${index + 1}`,
                date: parsedDate.toISOString(), // Store as ISO string for consistency
                diet: transformDietPlan(day.dietPlan),
                exercises: Array.isArray(day.exercises) ? day.exercises : [],
                medicines: transformMedicines(day.medicines),
                notes: day.focusNote || `Focus on maintaining a healthy lifestyle`,
                progress: day.progress || 0
              };
            }) || []
          };
          setWeeklyPlan(transformedPlan);
        } else {
          // Fallback: Generate planner from report data
          generatePlanFromReportData(report);
        }
      } catch (error) {
        console.error('Error generating planner from backend:', error);
        // Fallback: Generate planner from report data
        generatePlanFromReportData(report);
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generatePlanFromReportData = (report: any) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dietPreference = report.dietPreference || 'non-vegetarian';
    const weekPlan: DayPlan[] = days.map((day, index) => {
      const dietArray = Array.isArray(report.foodsToEat) ? report.foodsToEat : [];
      const exercisesArray = Array.isArray(report.exercises) ? report.exercises : [];
      const yogaArray = Array.isArray(report.yoga) ? report.yoga : [];
      const medicinesArray = Array.isArray(report.medicines) ? report.medicines : [];
      const preventionArray = Array.isArray(report.prevention) ? report.prevention : [];

      const date = new Date();
      date.setDate(date.getDate() + index);
      
      return {
        day,
        date: date.toISOString(), // Store as ISO string for consistency
        diet: generateDailyDiet(dietArray, day, dietPreference),
        exercises: generateDailyExercises(exercisesArray, yogaArray, day),
        medicines: medicinesArray.slice(0, 3),
        notes: preventionArray.length > 0 
          ? `Focus on ${preventionArray[index % preventionArray.length]}` 
          : 'Focus on maintaining a healthy lifestyle',
        progress: 0
      };
    });

      const plan: WeeklyPlan = {
        id: Date.now().toString(),
      reportId: reportId!,
      userId: user!.id,
        createdDate: new Date().toISOString(),
        weekPlan
      };

      setWeeklyPlan(plan);
  };

  const transformDietPlan = (dietPlan: any): string[] => {
    if (Array.isArray(dietPlan)) return dietPlan;
    if (typeof dietPlan === 'object' && dietPlan !== null) {
      return [
        dietPlan.breakfast ? `Breakfast: ${dietPlan.breakfast}` : 'Breakfast: Healthy meal',
        dietPlan.midMorningSnack ? `Mid-Morning: ${dietPlan.midMorningSnack}` : 'Mid-Morning: Light snack',
        dietPlan.lunch ? `Lunch: ${dietPlan.lunch}` : 'Lunch: Balanced meal',
        dietPlan.eveningSnack ? `Evening: ${dietPlan.eveningSnack}` : 'Evening: Healthy snack',
        dietPlan.dinner ? `Dinner: ${dietPlan.dinner}` : 'Dinner: Nutritious meal',
        dietPlan.hydration || 'Stay hydrated: Drink 8-10 glasses of water'
      ].filter(Boolean);
    }
    return ['Maintain a balanced diet throughout the day'];
  };

  const transformMedicines = (medicines: any): string[] => {
    if (Array.isArray(medicines)) {
      return medicines.map((med: any) => {
        if (typeof med === 'string') return med;
        if (typeof med === 'object' && med.name) {
          return med.note ? `${med.name} - ${med.note}` : med.name;
        }
        return 'Consult your doctor';
      });
    }
    return [];
  };

  const generateDailyDiet = (foods: string[], day: string, dietPreference: string = 'non-vegetarian'): string[] => {
    // Filter foods based on diet preference
    const isVegetarian = dietPreference === 'vegetarian';
    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
    
    // Expanded food options for variety
    const vegetarianBreakfasts = ['Oatmeal with fruits', 'Scrambled eggs with toast', 'Greek yogurt with berries', 'Avocado toast', 'Poha with vegetables', 'Idli with sambar', 'Paratha with yogurt'];
    const nonVegBreakfasts = ['Eggs and toast', 'Greek yogurt with nuts', 'Chicken sandwich', 'Fish curry with rice', 'Oatmeal with banana', 'Scrambled eggs with veggies', 'Protein smoothie'];
    
    const vegetarianLunches = ['Dal and rice with vegetables', 'Paneer curry with roti', 'Vegetable biryani', 'Rajma with rice', 'Chana masala with naan', 'Mixed vegetable curry', 'Tofu stir-fry'];
    const nonVegLunches = ['Grilled chicken with rice', 'Fish curry with vegetables', 'Chicken biryani', 'Egg curry with roti', 'Lamb curry with rice', 'Paneer butter masala', 'Seafood pasta'];
    
    const vegetarianDinners = ['Vegetable soup with bread', 'Stir-fried vegetables with tofu', 'Pasta primavera', 'Dal tadka with chapati', 'Vegetable pulao', 'Quinoa salad', 'Mixed vegetable curry'];
    const nonVegDinners = ['Grilled fish with vegetables', 'Chicken curry with rice', 'Lamb kebabs with salad', 'Egg bhurji with paratha', 'Tandoori chicken', 'Fish tikka', 'Lean chicken salad'];
    
    const snacks = ['Mixed nuts and seeds', 'Fresh fruit', 'Green tea with biscuits', 'Yogurt with honey', 'Protein smoothie', 'Dark chocolate', 'Hummus with vegetables'];
    
    const breakfasts = isVegetarian ? vegetarianBreakfasts : nonVegBreakfasts;
    const lunches = isVegetarian ? vegetarianLunches : nonVegLunches;
    const dinners = isVegetarian ? vegetarianDinners : nonVegDinners;
    
    // Use different foods each day based on day index
    const meals = [
      `Breakfast: ${breakfasts[dayIndex % breakfasts.length]}`,
      `Mid-Morning Snack: ${snacks[dayIndex % snacks.length]}`,
      `Lunch: ${lunches[dayIndex % lunches.length]}`,
      `Evening Snack: ${snacks[(dayIndex + 2) % snacks.length]}`,
      `Dinner: ${dinners[dayIndex % dinners.length]}`,
      'Stay hydrated: Drink 8-10 glasses of water'
    ];
    return meals;
  };

  const generateDailyExercises = (exercises: string[], yoga: string[], day: string): string[] => {
    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
    
    // Expanded exercise options for variety
    const exerciseOptions = [
      'Morning walk 30 minutes',
      'Cycling 20 minutes',
      'Swimming 30 minutes',
      'Jogging 15 minutes',
      'Stair climbing 10 minutes',
      'Dancing 20 minutes',
      'Hiking or nature walk'
    ];
    
    const yogaOptions = [
      'Sun Salutation (Surya Namaskar) - 15 minutes',
      'Warrior poses and stretching - 20 minutes',
      'Tree pose and balance exercises - 15 minutes',
      'Downward dog and child\'s pose - 15 minutes',
      'Twisting poses for digestion - 15 minutes',
      'Bridge pose and core strengthening - 20 minutes',
      'Relaxation and meditation - 20 minutes'
    ];
    
    const stretchOptions = [
      'Full body stretching',
      'Neck and shoulder stretches',
      'Hip flexor stretches',
      'Hamstring and calf stretches',
      'Core strengthening exercises',
      'Dynamic warm-up routine',
      'Cool-down stretching'
    ];
    
    return [
      exercises[dayIndex % exercises.length] || exerciseOptions[dayIndex],
      exercises[(dayIndex + 1) % exercises.length] || stretchOptions[dayIndex],
      yoga[dayIndex % yoga.length] || yogaOptions[dayIndex],
      'Deep breathing exercises - 10 minutes'
    ];
  };

  const handleUpdateProgress = (dayIndex: number, progress: number) => {
    if (!weeklyPlan) return;
    
    const updatedPlan = { ...weeklyPlan };
    updatedPlan.weekPlan[dayIndex].progress = progress;
    setWeeklyPlan(updatedPlan);
    setProgressData({ ...progressData, [dayIndex]: progress });
    
    toast.success(`Progress updated for ${updatedPlan.weekPlan[dayIndex].day}`);
  };

  const handleSavePlan = () => {
    if (!weeklyPlan) return;

    const plans = JSON.parse(storage.getItem('weeklyPlans') || '[]');
    plans.push(weeklyPlan);
    storage.setItem('weeklyPlans', JSON.stringify(plans));
    
    toast.success('Weekly plan saved to dashboard!');
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  const calculateWeeklyAverage = (): number => {
    if (!weeklyPlan) return 0;
    const completed = weeklyPlan.weekPlan.filter(d => d.progress && d.progress > 0);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, d) => acc + (d.progress || 0), 0);
    return Math.round(sum / completed.length);
  };

  const handleDownloadPDF = () => {
    if (!weeklyPlan) return;

    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Weekly Diet & Exercise Plan', margin, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Created: ${new Date(weeklyPlan.createdDate).toLocaleDateString()}`, margin, yPos);
    yPos += 10;

    weeklyPlan.weekPlan.forEach((dayPlan) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(dayPlan.day, margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      doc.text('Diet:', margin, yPos);
      yPos += 6;
      dayPlan.diet.forEach((item) => {
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 5;
      });

      yPos += 3;
      doc.text('Exercises:', margin, yPos);
      yPos += 6;
      dayPlan.exercises.forEach((item) => {
        doc.text(`• ${item}`, margin + 5, yPos);
        yPos += 5;
      });

      yPos += 10;
    });

    doc.save('Weekly-Health-Plan.pdf');
    toast.success('Plan downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Generating your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (!weeklyPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="pt-32 px-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">No plan generated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-gray-900 dark:text-white mb-2">Your Weekly Health Plan</h1>
                <p className="text-gray-600 dark:text-gray-300">Follow this personalized plan to achieve optimal health results</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  {viewMode === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                  {viewMode === 'list' ? 'Calendar View' : 'List View'}
                </button>
                <button
                  onClick={() => setShowProgress(!showProgress)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  {showProgress ? 'Hide Progress' : 'Track Progress'}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl transition-shadow"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={handleSavePlan}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-xl transition-shadow"
                >
                  <CheckCircle className="w-5 h-5" />
                  Save to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Average Progress */}
          {showProgress && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white mb-2">Weekly Average Progress</h2>
                  <p className="text-white/90">Track your daily completion to see improvements</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold">{calculateWeeklyAverage()}%</div>
                  <div className="text-white/90">completion</div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="mb-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-gray-900 dark:text-white mb-6 text-xl font-semibold">Weekly Calendar</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Calendar Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2 border-b border-gray-200 dark:border-gray-700">
                        {day}
                      </div>
                    ))}
                    {/* Calendar Days */}
                    {(() => {
                      // Get the first day's date from the week plan
                      const firstDayPlan = weeklyPlan.weekPlan[0];
                      let startDate: Date;
                      
                      if (firstDayPlan?.date) {
                        startDate = typeof firstDayPlan.date === 'string' 
                          ? new Date(firstDayPlan.date)
                          : new Date(firstDayPlan.date);
                      } else {
                        startDate = new Date();
                      }
                      
                      // Find the Sunday of that week
                      const dayOfWeek = startDate.getDay();
                      const sundayDate = new Date(startDate);
                      sundayDate.setDate(startDate.getDate() - dayOfWeek);
                      
                      const calendarDays: Array<{ date: Date; dayPlan?: DayPlan }> = [];
                      
                      // Create 7 days starting from Sunday
                      for (let i = 0; i < 7; i++) {
                        const currentDate = new Date(sundayDate);
                        currentDate.setDate(sundayDate.getDate() + i);
                        
                        // Find matching day plan for this date
                        const matchingDayPlan = weeklyPlan.weekPlan.find((dp) => {
                          if (!dp.date) return false;
                          const dpDate = typeof dp.date === 'string' ? new Date(dp.date) : new Date(dp.date);
                          return dpDate.toDateString() === currentDate.toDateString();
                        });
                        
                        calendarDays.push({ 
                          date: currentDate, 
                          dayPlan: matchingDayPlan 
                        });
                      }
                      
                      return calendarDays.map((item, idx) => {
                        const isInPlan = item.dayPlan !== undefined;
                        const isToday = item.date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate && item.date.toDateString() === selectedDate.toDateString();
                        const progress = item.dayPlan?.progress || 0;
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => item.dayPlan && setSelectedDate(item.date)}
                            className={`relative min-h-[100px] p-3 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 shadow-lg scale-105'
                                : isInPlan
                                ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20 hover:border-emerald-500 hover:shadow-md'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 opacity-40 cursor-not-allowed'
                            } ${isToday ? 'ring-2 ring-cyan-400 ring-offset-1' : ''}`}
                          >
                            <div className={`text-sm font-bold mb-2 ${
                              isSelected 
                                ? 'text-cyan-700 dark:text-cyan-300'
                                : isInPlan
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : 'text-gray-500 dark:text-gray-500'
                            }`}>
                              {item.date.getDate()}
                            </div>
                            {isInPlan && item.dayPlan && (
                              <div className="space-y-1.5">
                                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                                  {item.dayPlan.day.substring(0, 3)}
                                </div>
                                {showProgress && progress > 0 && (
                                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-500 transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <Apple className="w-3 h-3" />
                                  <span className="truncate">Diet</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <Dumbbell className="w-3 h-3" />
                                  <span className="truncate">Exercise</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Selected Day Details Panel */}
                <div className="lg:col-span-1">
                  {selectedDate ? (() => {
                    const selectedDayPlan = weeklyPlan.weekPlan.find((dp) => {
                      if (!dp.date) return false;
                      const dpDate = typeof dp.date === 'string' ? new Date(dp.date) : new Date(dp.date);
                      return dpDate.toDateString() === selectedDate.toDateString();
                    });
                    
                    if (!selectedDayPlan) {
                      return (
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                          <p className="text-gray-500 dark:text-gray-400 text-center">Select a date with a plan</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
                        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedDayPlan.day}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          {showProgress && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedDayPlan.progress || 0}%</span>
                              </div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                                  style={{ width: `${selectedDayPlan.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                          {/* Diet Plan */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Apple className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <h4 className="text-gray-900 dark:text-white font-semibold">Diet Plan</h4>
                            </div>
                            <ul className="space-y-2">
                              {Array.isArray(selectedDayPlan.diet) ? selectedDayPlan.diet.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                  <span className="text-emerald-500 mt-1 text-xs">●</span>
                                  <span className="flex-1">{item}</span>
                                </li>
                              )) : (
                                <li className="text-gray-500 dark:text-gray-400 text-sm">Diet plan available</li>
                              )}
                            </ul>
                          </div>
                          
                          {/* Exercises */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                <Dumbbell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <h4 className="text-gray-900 dark:text-white font-semibold">Exercises</h4>
                            </div>
                            <ul className="space-y-2">
                              {selectedDayPlan.exercises.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                  <span className="text-cyan-500 mt-1 text-xs">●</span>
                                  <span className="flex-1">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Medicines */}
                          {Array.isArray(selectedDayPlan.medicines) && selectedDayPlan.medicines.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="text-gray-900 dark:text-white font-semibold">Medicines</h4>
                              </div>
                              <ul className="space-y-2">
                                {selectedDayPlan.medicines.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                                    <span className="text-blue-500 mt-1 text-xs">●</span>
                                    <span className="flex-1">{typeof item === 'string' ? item : (item.name || 'Medicine')}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Focus Note */}
                          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-2">
                              <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-yellow-900 dark:text-yellow-200 font-medium mb-1">Focus Note</h5>
                                <p className="text-yellow-800 dark:text-yellow-300 text-sm">{selectedDayPlan.notes}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Update (if enabled) */}
                          {showProgress && (
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Update Progress
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={selectedDayPlan.progress || 0}
                                onChange={(e) => {
                                  const dayIndex = weeklyPlan.weekPlan.findIndex(dp => dp.day === selectedDayPlan.day);
                                  if (dayIndex !== -1) {
                                    handleUpdateProgress(dayIndex, parseInt(e.target.value));
                                  }
                                }}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-500"
                              />
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                      <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Select a Date</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Click on any highlighted date in the calendar to view that day's plan</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily Plans List View */}
          {viewMode === 'list' && (
          <div className="space-y-6">
            {weeklyPlan.weekPlan.map((dayPlan, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white">{dayPlan.day}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {dayPlan.date 
                          ? (typeof dayPlan.date === 'string' 
                              ? new Date(dayPlan.date).toLocaleDateString()
                              : new Date(dayPlan.date).toLocaleDateString())
                          : 'Date not set'}
                      </p>
                    </div>
                  </div>

                  {showProgress && (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dayPlan.progress || 0}
                        onChange={(e) => handleUpdateProgress(index, parseInt(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-gray-900 dark:text-white font-bold w-12">{dayPlan.progress || 0}%</span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Diet */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Apple className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-gray-900 dark:text-white">Diet Plan</h4>
                    </div>
                    <ul className="space-y-2">
                      {Array.isArray(dayPlan.diet) ? dayPlan.diet.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      )) : (
                        <li className="text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>Diet plan available</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Exercises */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Dumbbell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <h4 className="text-gray-900 dark:text-white">Exercises</h4>
                    </div>
                    <ul className="space-y-2">
                      {dayPlan.exercises.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-cyan-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Medicines & Notes */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-gray-900 dark:text-white">Medicines</h4>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {Array.isArray(dayPlan.medicines) && dayPlan.medicines.length > 0 ? dayPlan.medicines.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{typeof item === 'string' ? item : (item.name || 'Medicine')}</span>
                        </li>
                      )) : (
                        <li className="text-gray-500 dark:text-gray-400 text-sm">No medicines prescribed</li>
                      )}
                    </ul>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-yellow-900 dark:text-yellow-200 text-sm">{dayPlan.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Progress Summary */}
          {showProgress && (
            <div className="mt-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-gray-900 dark:text-white mb-4">Progress Summary & Suggestions</h3>
              <div className="space-y-3">
                {calculateWeeklyAverage() >= 80 && (
                  <p className="text-emerald-600 dark:text-emerald-400">🎉 Excellent work! You're maintaining great consistency. Keep it up!</p>
                )}
                {calculateWeeklyAverage() >= 50 && calculateWeeklyAverage() < 80 && (
                  <div>
                    <p className="text-cyan-600 dark:text-cyan-400 mb-2">👍 Good progress! Here are some tips to improve:</p>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                      <li>• Try to be more consistent with daily routines</li>
                      <li>• Focus on completing at least one full category each day</li>
                      <li>• Set reminders for meals and exercise times</li>
                    </ul>
                  </div>
                )}
                {calculateWeeklyAverage() < 50 && calculateWeeklyAverage() > 0 && (
                  <div>
                    <p className="text-yellow-600 dark:text-yellow-400 mb-2">💪 Room for improvement! Try these suggestions:</p>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm ml-4">
                      <li>• Start with small, achievable goals</li>
                      <li>• Focus on one aspect at a time (diet, then exercise)</li>
                      <li>• Seek support from family or friends</li>
                      <li>• Remember: consistency is more important than perfection</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-yellow-900 dark:text-yellow-200 text-sm">
              <strong>Note:</strong> This plan is AI-generated based on your health report. Please consult with healthcare professionals before making significant changes to your diet or exercise routine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
