import { useState, useEffect } from 'react';
import { AlertCircle, Phone, MapPin, Navigation, Hospital, Ambulance } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  lat: number;
  lng: number;
}

const emergencyNumbers = [
  { name: 'National Emergency Helpline', number: '108', icon: Ambulance },
  { name: 'Unified Emergency Number', number: '112', icon: Phone },
  { name: 'Police', number: '100', icon: Phone },
  { name: 'Fire', number: '101', icon: Phone },
];

// Mock nearby hospitals data
const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Main Street, City Center',
    phone: '+91-11-1234-5678',
    distance: '2.5 km',
    lat: 28.6139,
    lng: 77.2090,
  },
  {
    id: '2',
    name: 'Metro Medical Center',
    address: '456 Health Avenue, Downtown',
    phone: '+91-11-2345-6789',
    distance: '4.1 km',
    lat: 28.7041,
    lng: 77.1025,
  },
  {
    id: '3',
    name: 'Emergency Care Hospital',
    address: '789 Emergency Road, Medical District',
    phone: '+91-11-3456-7890',
    distance: '5.8 km',
    lat: 28.5355,
    lng: 77.3910,
  },
  {
    id: '4',
    name: 'Community Health Center',
    address: '321 Wellness Boulevard',
    phone: '+91-11-4567-8901',
    distance: '7.2 km',
    lat: 28.6920,
    lng: 77.1530,
  },
];

export default function EmergencyHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('EmergencyHelp component mounted');
    return () => console.log('EmergencyHelp component unmounted');
  }, []);

  useEffect(() => {
    console.log('isOpen state changed to:', isOpen);
  }, [isOpen]);

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSendLocation = (hospital: Hospital) => {
    // Open Google Maps with hospital location
    const url = `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
    window.open(url, '_blank');
  };

  const handleLocateNearby = () => {
    // Get user's location and show hospitals on map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Open Google Maps with nearby hospitals
          const url = `https://www.google.com/maps/search/hospital/@${latitude},${longitude},12z`;
          window.open(url, '_blank');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback: open Google Maps search for hospitals
          window.open('https://www.google.com/maps/search/hospital', '_blank');
        }
      );
    } else {
      // Fallback: open Google Maps search for hospitals
      window.open('https://www.google.com/maps/search/hospital', '_blank');
    }
  };

  return (
    <div className="relative z-[9999]" style={{ pointerEvents: 'auto' }}>
      <button
        onClick={(e) => {
          console.log('Button onClick triggered', e);
          e.preventDefault();
          e.stopPropagation();
          console.log('Setting isOpen to true');
          setIsOpen(true);
        }}
        onMouseEnter={() => console.log('Button hover')}
        onMouseLeave={() => console.log('Button leave')}
        type="button"
        className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
        style={{ 
          pointerEvents: 'auto', 
          position: 'relative', 
          zIndex: 99999,
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <AlertCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Need Urgent Help?</span>
        <span className="sm:hidden">Help</span>
      </button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        console.log('Dialog open state changed:', open);
        setIsOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              Quick Emergency Connect
            </DialogTitle>
            <DialogDescription>
              Get immediate help with emergency helplines and nearby hospitals
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Emergency Helpline Numbers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-red-600" />
                National Emergency Helpline Numbers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emergencyNumbers.map((emergency) => {
                  const Icon = emergency.icon;
                  return (
                    <div
                      key={emergency.number}
                      className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/40">
                          <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {emergency.name}
                          </p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {emergency.number}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCall(emergency.number)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nearby Hospitals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-emerald-600" />
                  Nearby Hospitals
                </h3>
                <Button
                  onClick={handleLocateNearby}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Locate on Map
                </Button>
              </div>
              <div className="space-y-3">
                {mockHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {hospital.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{hospital.address}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {hospital.phone}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {hospital.distance} away
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleCall(hospital.phone)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap"
                        >
                          <Phone className="w-4 h-4" />
                          Call Now
                        </Button>
                        <Button
                          onClick={() => handleSendLocation(hospital)}
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          <MapPin className="w-4 h-4" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Help Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Important:</strong> In case of a medical emergency, call the emergency
                  helpline immediately. This service provides quick access to emergency contacts
                  and nearby healthcare facilities. Always prioritize contacting emergency services
                  for life-threatening situations.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

