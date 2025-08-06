import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/types/flight";
import StatusBadge from "@/components/StatusBadge";
import FidsSettings from "@/components/FidsSettings";
import { useFullscreen } from "@/hooks/useFullscreen";
import { mockFlightService } from "@/services/mockFlightData";
import { Plane, Clock, MapPin, Hash, Building, Users, Settings, Monitor, Maximize, Home } from "lucide-react";
import { format, addHours } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FidsDisplay = () => {
  const navigate = useNavigate();
  const { isFullscreen, toggleFullscreen, enterFullscreen } = useFullscreen();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  const [showSettings, setShowSettings] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState({
    useMockData: true, // Default to mock data for testing
    refreshInterval: 60,
    showSystemTime: true,
    kioskMode: false,
    autoFullscreen: false
  });

  const fetchFlights = useCallback(async () => {
    try {
      setConnectionStatus('connected');
      
      if (settings.useMockData) {
        // Use mock data
        const mockFlights = await mockFlightService.getUpcomingDepartures();
        setFlights(mockFlights);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // Use Supabase data
      const now = new Date();
      const threeHoursFromNow = addHours(now, 3);

      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .gte('scheduled_departure', now.toISOString())
        .lte('scheduled_departure', threeHoursFromNow.toISOString())
        .order('scheduled_departure', { ascending: true });

      if (error) {
        console.error('Error fetching flights:', error);
        setConnectionStatus('error');
        return;
      }

      setFlights((data || []) as Flight[]);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      setLoading(false);
    }
  }, [settings.useMockData]);

  useEffect(() => {
    fetchFlights();
    
    // Auto-refresh based on settings
    const interval = setInterval(fetchFlights, settings.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [fetchFlights, settings.refreshInterval]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Auto fullscreen on load if enabled
  useEffect(() => {
    if (settings.autoFullscreen && !isFullscreen) {
      enterFullscreen();
    }
  }, [settings.autoFullscreen, isFullscreen, enterFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default for our shortcuts
      switch (event.key.toLowerCase()) {
        case 's':
          event.preventDefault();
          setShowSettings(true);
          break;
        case 'r':
          event.preventDefault();
          fetchFlights();
          break;
        case 'escape':
          if (showSettings) {
            event.preventDefault();
            setShowSettings(false);
          }
          break;
        case 'a':
          event.preventDefault();
          setAdminMode(!adminMode);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, adminMode, fetchFlights]);

  // Kiosk mode - hide cursor after inactivity
  useEffect(() => {
    if (!settings.kioskMode) return;

    let timeout: NodeJS.Timeout;
    const hideCursor = () => document.body.style.cursor = 'none';
    const showCursor = () => document.body.style.cursor = 'default';

    const resetTimeout = () => {
      clearTimeout(timeout);
      showCursor();
      timeout = setTimeout(hideCursor, 5000); // Hide after 5 seconds
    };

    document.addEventListener('mousemove', resetTimeout);
    document.addEventListener('keydown', resetTimeout);
    
    // Initial timeout
    timeout = setTimeout(hideCursor, 5000);

    return () => {
      clearTimeout(timeout);
      showCursor();
      document.removeEventListener('mousemove', resetTimeout);
      document.removeEventListener('keydown', resetTimeout);
    };
  }, [settings.kioskMode]);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '--:--';
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return format(new Date(dateString), 'dd MMM');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fids-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-fids-accent mx-auto mb-4"></div>
          <p className="text-fids-text text-2xl font-medium">Loading Flight Information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fids-dark text-fids-text relative">
      {/* Admin Controls - Only show when admin mode is active */}
      {adminMode && (
        <div className="fixed top-4 left-4 z-40 flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            className="bg-fids-card border-fids-border text-fids-text hover:bg-fids-card-hover"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="bg-fids-card border-fids-border text-fids-text hover:bg-fids-card-hover"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-fids-card border-fids-border text-fids-text hover:bg-fids-card-hover"
          >
            <Maximize className="h-4 w-4 mr-2" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      )}

      {/* Settings Panel */}
      <FidsSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* Header */}
      <div className="bg-fids-primary p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Plane className="h-12 w-12 text-white" />
            <div>
              <h1 className="text-4xl font-bold text-white">Chennai Airport</h1>
              <p className="text-xl text-fids-accent font-medium">Flight Information Display System</p>
              {settings.useMockData && (
                <p className="text-sm text-yellow-200 mt-1">
                  ⚠️ DEMO MODE - Using Mock Data
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-white text-lg font-medium">
                {settings.useMockData ? 'DEMO' : 
                 connectionStatus === 'connected' ? 'LIVE' : 
                 connectionStatus === 'error' ? 'ERROR' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-fids-accent text-lg">
              Last Updated: {format(lastUpdated, 'HH:mm:ss')}
            </p>
            {settings.showSystemTime && (
              <p className="text-white text-lg">
                {format(currentTime, 'dd MMM yyyy, HH:mm:ss')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Flight Information */}
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-fids-accent mb-2">
            Upcoming Departures - Next 3 Hours
          </h2>
          <p className="text-xl text-fids-text-secondary">
            Showing {flights.length} flights
          </p>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-24 w-24 text-fids-text-secondary mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-fids-text mb-4">No Upcoming Flights</h3>
            <p className="text-xl text-fids-text-secondary">No flights scheduled in the next 3 hours</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="bg-fids-card border border-fids-border rounded-lg p-6 hover:bg-fids-card-hover transition-colors"
              >
                <div className="grid grid-cols-12 gap-6 items-center">
                  {/* Flight Number & Airline */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Hash className="h-6 w-6 text-fids-accent" />
                      <span className="text-2xl font-bold text-fids-accent">{flight.flight_number}</span>
                    </div>
                    <p className="text-lg font-medium text-fids-text">{flight.airline}</p>
                    {flight.aircraft_type && (
                      <p className="text-base text-fids-text-secondary">{flight.aircraft_type}</p>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-6 w-6 text-fids-accent" />
                      <span className="text-lg font-medium text-fids-text-secondary">To</span>
                    </div>
                    <p className="text-2xl font-bold text-fids-text">{flight.destination || 'TBA'}</p>
                  </div>

                  {/* Scheduled Time */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-6 w-6 text-fids-accent" />
                      <span className="text-lg font-medium text-fids-text-secondary">Scheduled</span>
                    </div>
                    <p className="text-2xl font-bold text-fids-text">
                      {formatTime(flight.scheduled_departure)}
                    </p>
                    <p className="text-base text-fids-text-secondary">
                      {formatDate(flight.scheduled_departure)}
                    </p>
                  </div>

                  {/* Actual Time */}
                  <div className="col-span-2">
                    <div className="mb-2">
                      <span className="text-lg font-medium text-fids-text-secondary">Actual</span>
                    </div>
                    <p className="text-2xl font-bold text-fids-text">
                      {formatTime(flight.actual_departure)}
                    </p>
                  </div>

                  {/* Gate & Terminal */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-6 w-6 text-fids-accent" />
                      <span className="text-lg font-medium text-fids-text-secondary">Gate</span>
                    </div>
                    <p className="text-2xl font-bold text-fids-text">{flight.gate || 'TBA'}</p>
                    {flight.terminal && (
                      <p className="text-base text-fids-text-secondary">Terminal {flight.terminal}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-right">
                    <StatusBadge status={flight.status} className="text-xl px-4 py-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-fids-primary/80 backdrop-blur-sm p-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center space-x-4">
            <p className="text-lg">
              Chennai International Airport - Flight Information Display System
            </p>
            {isFullscreen && (
              <div className="flex items-center space-x-2 text-fids-accent">
                <Monitor className="h-4 w-4" />
                <span className="text-sm">Fullscreen Mode</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <p className="text-lg">
              Auto-refresh: Every {settings.refreshInterval} seconds
            </p>
            {!adminMode && (
              <p className="text-sm text-fids-accent">
                Press 'A' for admin controls
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FidsDisplay;