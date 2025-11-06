import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, Activity, Thermometer, Droplet } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function LiveHealthView() {
  const { id } = useParams<{ id: string }>();
  const [healthReadings, setHealthReadings] = useState({
    heartRate: 85,
    bloodPressure: { systolic: 118, diastolic: 78 },
    temperature: 36.8,
    oxygenLevel: 97
  });
  
  const [pulseData, setPulseData] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 85 + Math.sin(i * 0.5) * 5
    }))
  );

  // Simulate live updates
  useEffect(() => {
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
    }, 3000);

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

    return () => {
      clearInterval(healthInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-gray-900 dark:text-white">Live Health Monitoring</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time health vitals - Link ID: {id}
            </p>
          </div>

          {/* Health Readings Panel */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* Heart Rate */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Heart Rate</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(healthReadings.heartRate)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">bpm</div>
            </div>

            {/* Blood Pressure */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blood Pressure</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(healthReadings.bloodPressure.systolic)}/{Math.round(healthReadings.bloodPressure.diastolic)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">mmHg</div>
            </div>

            {/* Temperature */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {healthReadings.temperature.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">°C</div>
            </div>

            {/* Oxygen Level */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Droplet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Oxygen Level</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(healthReadings.oxygenLevel)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">SpO2</div>
            </div>
          </div>

          {/* Pulse Chart */}
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Live Pulse Waveform</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
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

          {/* Info Note */}
          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              This is a live health monitoring view. Data updates every 3 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

