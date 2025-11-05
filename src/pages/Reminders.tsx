import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reminderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pill, 
  Dumbbell, 
  Calendar,
  Edit,
  Trash2,
  Activity,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

interface Reminder {
  _id: string;
  type: 'medicine' | 'exercise' | 'yoga' | 'doctor_visit' | 'other';
  title: string;
  description: string;
  scheduledTime: string;
  nextReminder: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    medicineName?: string;
    exerciseName?: string;
    doctorName?: string;
  };
}

export default function Reminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  const [formData, setFormData] = useState({
    type: 'medicine' as Reminder['type'],
    title: '',
    description: '',
    scheduledTime: '',
    frequency: 'daily' as Reminder['frequency'],
    priority: 'medium' as Reminder['priority'],
    daysOfWeek: [] as number[],
  });

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user, filterType, filterActive]);

  const fetchReminders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const filters: any = {};
      if (filterActive !== undefined) filters.isActive = filterActive;
      if (filterType !== 'all') filters.type = filterType;
      
      const response = await reminderAPI.getUserReminders(user.id, filters);
      if (response.success) {
        setReminders(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await reminderAPI.createReminder({
        userId: user.id,
        ...formData,
      });

      if (response.success) {
        toast.success('Reminder created successfully!');
        setShowForm(false);
        setFormData({
          type: 'medicine',
          title: '',
          description: '',
          scheduledTime: '',
          frequency: 'daily',
          priority: 'medium',
          daysOfWeek: [],
        });
        fetchReminders();
      }
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      toast.error(error.response?.data?.error || 'Failed to create reminder');
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      const response = await reminderAPI.completeReminder(id);
      if (response.success) {
        toast.success('Reminder marked as completed!');
        fetchReminders();
      }
    } catch (error: any) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  const handleToggleActive = async (reminder: Reminder) => {
    try {
      const response = await reminderAPI.updateReminder(reminder._id, {
        isActive: !reminder.isActive,
      });

      if (response.success) {
        toast.success(`Reminder ${!reminder.isActive ? 'activated' : 'deactivated'}`);
        fetchReminders();
      }
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const response = await reminderAPI.deleteReminder(id);
      if (response.success) {
        toast.success('Reminder deleted successfully!');
        fetchReminders();
      }
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'medicine':
        return <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'exercise':
        return <Dumbbell className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'yoga':
        return <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'doctor_visit':
        return <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700';
    }
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const upcomingReminders = activeReminders
    .filter(r => new Date(r.nextReminder) > new Date())
    .sort((a, b) => new Date(a.nextReminder).getTime() - new Date(b.nextReminder).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-gray-900 dark:text-white mb-2">Smart Health Reminders</h1>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered reminders to keep you consistent with your health routine
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Create Reminder
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Reminders</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
                </div>
                <Bell className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeReminders.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                    {reminders.filter(r => r.isCompleted).length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingReminders.length}</p>
                </div>
                <Sun className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Create Reminder Form */}
          {showForm && (
            <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-gray-900 dark:text-white mb-4">Create New Reminder</h2>
              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Reminder['type'] })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="medicine">Medicine</option>
                      <option value="exercise">Exercise</option>
                      <option value="yoga">Yoga</option>
                      <option value="doctor_visit">Doctor Visit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Reminder['priority'] })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="e.g., Take Vitamin D"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Scheduled Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Frequency *</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Reminder['frequency'] })}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
                  >
                    Create Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="medicine">Medicine</option>
              <option value="exercise">Exercise</option>
              <option value="yoga">Yoga</option>
              <option value="doctor_visit">Doctor Visit</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                if (e.target.value === 'all') setFilterActive(undefined);
                else setFilterActive(e.target.value === 'active');
              }}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Reminders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No reminders found</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
              >
                <Plus className="w-5 h-5" />
                Create Your First Reminder
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 ${
                    reminder.isActive
                      ? 'border-emerald-200 dark:border-emerald-800'
                      : 'border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(reminder.type)}
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold">{reminder.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{reminder.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority}
                    </span>
                  </div>

                  {reminder.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{reminder.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(reminder.nextReminder).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Activity className="w-4 h-4" />
                      <span className="capitalize">{reminder.frequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleCompleteReminder(reminder._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleToggleActive(reminder)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        reminder.isActive
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {reminder.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder._id)}
                      className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


