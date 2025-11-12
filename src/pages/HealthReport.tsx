import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { healthReportAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Download, Calendar, ArrowLeft, Activity, AlertTriangle, Heart, Apple, Dumbbell, ShieldAlert, Stethoscope, Leaf, CheckCircle, XCircle, Pill, Bell, Play, ExternalLink, Youtube } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { reminderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HealthReportType {
  _id?: string;
  id?: string;
  userId: string;
  date: string;
  symptoms: string[];
  causes: string[];
  deficiencies: string[];
  prevention: string[];
  cure: string[];
  medicines: string[];
  yoga: string[];
  exercises: string[];
  foodsToEat: string[];
  foodsToAvoid: string[];
  thingsToFollow: string[];
  thingsToAvoid: string[];
  naturalRemedies: string[];
  healthScore: number;
  summary: string;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

export default function HealthReport() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<HealthReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await healthReportAPI.getReportById(id!);
      if (response.success && response.data) {
        const reportData = response.data;
        // Transform backend response to match frontend format
        const formattedReport: HealthReportType = {
          _id: reportData._id,
          id: reportData._id,
          userId: reportData.userId || '',
          date: reportData.date || new Date().toISOString(),
          symptoms: reportData.symptoms || [],
          causes: reportData.causes || [],
          deficiencies: reportData.deficiencies || [],
          prevention: Array.isArray(reportData.prevention) ? reportData.prevention : (reportData.prevention ? [reportData.prevention] : []),
          cure: reportData.cure || [],
          medicines: reportData.medicines || [],
          yoga: reportData.yoga || [],
          exercises: reportData.exercises || [],
          foodsToEat: reportData.foodsToEat || [],
          foodsToAvoid: reportData.foodsToAvoid || [],
          thingsToFollow: reportData.thingsToFollow || [],
          thingsToAvoid: reportData.thingsToAvoid || [],
          naturalRemedies: reportData.naturalRemedies || [],
          healthScore: reportData.healthScore || 70,
          summary: reportData.summary || ''
        };
        setReport(formattedReport);
        
        // Fetch YouTube videos if symptoms are available
        if (formattedReport.symptoms && formattedReport.symptoms.length > 0) {
          fetchYouTubeVideos(formattedReport.symptoms);
        }
      } else {
        toast.error('Report not found');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchYouTubeVideos = async (symptoms: string[]) => {
    try {
      setVideosLoading(true);
      const response = await healthReportAPI.getYouTubeVideos(symptoms);
      if (response.success && response.data) {
        setVideos(response.data);
      } else {
        console.warn('Failed to fetch YouTube videos:', response.error);
      }
    } catch (error: any) {
      console.error('Error fetching YouTube videos:', error);
      // Don't show error toast - videos are optional
    } finally {
      setVideosLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('Health Analysis Report', margin, yPosition);
    yPosition += 15;

    // Date and Score
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`, margin, yPosition);
    doc.text(`Health Score: ${report.healthScore}/100`, pageWidth - margin - 50, yPosition);
    yPosition += 10;

    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const summaryLines = doc.splitTextToSize(report.summary, pageWidth - 2 * margin);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * lineHeight + 10;

    // Helper function to add section
    const addSection = (title: string, items: string[]) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(title, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      items.forEach((item) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 2 * margin - 10);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * lineHeight;
      });
      yPosition += 5;
    };

    // Add all sections
    addSection('Detected Symptoms', report.symptoms);
    addSection('Possible Causes', report.causes);
    addSection('Nutritional Deficiencies', report.deficiencies);
    addSection('Prevention Tips', report.prevention);
    addSection('Cure & Treatment', report.cure);
    addSection('Recommended Medicines', report.medicines);
    addSection('Yoga Practices', report.yoga);
    addSection('Exercise Recommendations', report.exercises);
    addSection('Foods to Eat', report.foodsToEat);
    addSection('Foods to Avoid', report.foodsToAvoid);
    addSection('Things to Follow', report.thingsToFollow);
    addSection('Things to Avoid', report.thingsToAvoid);
    addSection('Natural Remedies & Herbs', report.naturalRemedies);

    // Disclaimer
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition += 10;
    doc.setFontSize(9);
    doc.setTextColor(200, 50, 50);
    const disclaimerText = 'MEDICAL DISCLAIMER: This report is generated by AI for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
    doc.text(disclaimerLines, margin, yPosition);

    doc.save(`Health-Report-${new Date(report.date).toLocaleDateString()}.pdf`);
    toast.success('Report downloaded successfully!');
  };

  const handleAddToDashboard = () => {
    toast.success('Report saved to your dashboard!');
  };

  const handleMakeDietPlan = () => {
    navigate(`/diet-planner/${id}`);
  };
  
  const reportId = report?._id || report?.id || id;

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading report...</p>
        </div>
      </div>
    );
  }

  const ReportSection = ({ title, items, icon: Icon }: { title: string; items: string[]; icon: any }) => (
    <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-emerald-500 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-gray-900 dark:text-white mb-2">Your Health Report</h1>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Health Score: {report.healthScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAddToDashboard}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Add to Dashboard
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-xl transition-shadow"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={handleMakeDietPlan}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-xl transition-shadow"
                >
                  <Calendar className="w-5 h-5" />
                  Make Diet Plan
                </button>
                {report.medicines && report.medicines.length > 0 && user && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await reminderAPI.createRemindersFromReport(id!, user.id);
                        if (response.success) {
                          toast.success(`${response.message || 'Medicine reminders created!'}`);
                          navigate('/reminders');
                        }
                      } catch (error: any) {
                        console.error('Error creating reminders:', error);
                        toast.error(error.response?.data?.error || 'Failed to create reminders');
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white hover:shadow-xl transition-shadow"
                  >
                    <Bell className="w-5 h-5" />
                    Create Medicine Reminders
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white mb-2">Your Health Score</h2>
                <p className="text-white/90">
                  {report.healthScore >= 80 ? 'Excellent! Keep up the good work.' :
                   report.healthScore >= 60 ? 'Good, but there\'s room for improvement.' :
                   'Needs attention. Follow the recommendations below.'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold">{report.healthScore}</div>
                <div className="text-white/90">out of 100</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-gray-900 dark:text-white mb-3">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{report.summary || 'No summary available'}</p>
          </div>

          {/* YouTube Videos Section */}
          {report.symptoms && report.symptoms.length > 0 && (
            <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white text-xl font-semibold">Related Health Videos</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Educational videos about your symptoms</p>
                </div>
              </div>

              {videosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading videos...</span>
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <a
                      key={video.videoId}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-200 dark:bg-gray-600 overflow-hidden">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                          </div>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                          YouTube
                        </div>
                      </div>
                      
                      {/* Video Info */}
                      <div className="p-4">
                        <h4 className="text-gray-900 dark:text-white font-semibold line-clamp-2 mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <span>{video.channelTitle}</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <ExternalLink className="w-3 h-3" />
                            Watch
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No videos available at the moment.</p>
                  <p className="text-sm mt-1">Please check your YouTube API configuration.</p>
                </div>
              )}
            </div>
          )}

          {/* Main Report Sections */}
          <div className="space-y-6">
            {report.symptoms && report.symptoms.length > 0 && <ReportSection title="Detected Symptoms" items={report.symptoms} icon={AlertTriangle} />}
            {report.causes && report.causes.length > 0 && <ReportSection title="Possible Causes" items={report.causes} icon={ShieldAlert} />}
            {report.deficiencies && report.deficiencies.length > 0 && <ReportSection title="Nutritional Deficiencies" items={report.deficiencies} icon={Apple} />}
            {report.prevention && report.prevention.length > 0 && <ReportSection title="Prevention Tips" items={report.prevention} icon={Heart} />}
            {report.cure && report.cure.length > 0 && <ReportSection title="Cure & Treatment" items={report.cure} icon={Stethoscope} />}
            {report.medicines && report.medicines.length > 0 && <ReportSection title="Recommended Medicines" items={report.medicines} icon={Pill} />}
            {report.yoga && report.yoga.length > 0 && <ReportSection title="Yoga Practices" items={report.yoga} icon={Activity} />}
            {report.exercises && report.exercises.length > 0 && <ReportSection title="Exercise Recommendations" items={report.exercises} icon={Dumbbell} />}
            {report.foodsToEat && report.foodsToEat.length > 0 && <ReportSection title="Foods to Eat" items={report.foodsToEat} icon={Apple} />}
            {report.foodsToAvoid && report.foodsToAvoid.length > 0 && <ReportSection title="Foods to Avoid" items={report.foodsToAvoid} icon={XCircle} />}
            {report.thingsToFollow && report.thingsToFollow.length > 0 && <ReportSection title="Things to Follow" items={report.thingsToFollow} icon={CheckCircle} />}
            {report.thingsToAvoid && report.thingsToAvoid.length > 0 && <ReportSection title="Things to Avoid" items={report.thingsToAvoid} icon={XCircle} />}
            {report.naturalRemedies && report.naturalRemedies.length > 0 && <ReportSection title="Natural Remedies & Herbs" items={report.naturalRemedies} icon={Leaf} />}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-900 dark:text-yellow-200 mb-2">Medical Disclaimer</h3>
                <p className="text-yellow-900 dark:text-yellow-200 text-sm leading-relaxed">
                  This report is generated by AI for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this report. If you think you may have a medical emergency, call your doctor or emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
