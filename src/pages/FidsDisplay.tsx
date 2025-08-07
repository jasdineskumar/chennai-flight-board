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
    autoFullscreen: false,
    flightsPerPage: 8,
    pageInterval: 15 // seconds between pages
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [displayType, setDisplayType] = useState<'domestic' | 'international'>('domestic');

  const fetchFlights = useCallback(async () => {
    try {
      setConnectionStatus('connected');
      
      if (settings.useMockData) {
        // Use mock data
        const mockFlights = await mockFlightService.getUpcomingDepartures(displayType);
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

      // Filter by domestic/international
      const filteredFlights = (data || []).filter(flight => {
        const isDomestic = flight.destination?.includes('(') && 
          ['BOM', 'DEL', 'BLR', 'HYD', 'CCU', 'PNQ', 'AMD', 'GOI', 'COK', 'TRV'].some(code => 
            flight.destination?.includes(code)
          );
        return displayType === 'domestic' ? isDomestic : !isDomestic;
      });

      setFlights(filteredFlights as Flight[]);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
      setLoading(false);
    }
  }, [settings.useMockData, displayType]);

  useEffect(() => {
    fetchFlights();
    setCurrentPage(0); // Reset to first page when display type changes
    
    // Auto-refresh based on settings
    const interval = setInterval(fetchFlights, settings.refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [fetchFlights, settings.refreshInterval]);

  // Pagination - cycle through pages
  useEffect(() => {
    const totalPages = Math.ceil(flights.length / settings.flightsPerPage);
    if (totalPages <= 1) return;

    const pageInterval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % totalPages);
    }, settings.pageInterval * 1000);

    return () => clearInterval(pageInterval);
  }, [flights.length, settings.flightsPerPage, settings.pageInterval]);

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
        case 'd':
          event.preventDefault();
          setDisplayType('domestic');
          break;
        case 'i':
          event.preventDefault();
          setDisplayType('international');
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
          <Button
            variant={displayType === 'domestic' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setDisplayType('domestic')}
            className="bg-fids-card border-fids-border text-fids-text hover:bg-fids-card-hover"
          >
            Domestic
          </Button>
          <Button
            variant={displayType === 'international' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setDisplayType('international')}
            className="bg-fids-card border-fids-border text-fids-text hover:bg-fids-card-hover"
          >
            International
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
              <p className="text-xl text-fids-accent font-medium">
                {displayType === 'domestic' ? 'Domestic' : 'International'} Departures - FIDS
              </p>
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
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-fids-accent mb-2">
                {displayType === 'domestic' ? 'Domestic' : 'International'} Departures - Next 3 Hours
              </h2>
              <p className="text-xl text-fids-text-secondary">
                Showing {Math.min(settings.flightsPerPage, flights.length - currentPage * settings.flightsPerPage)} of {flights.length} flights
              </p>
            </div>
            {Math.ceil(flights.length / settings.flightsPerPage) > 1 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-fids-accent">
                  Page {currentPage + 1} of {Math.ceil(flights.length / settings.flightsPerPage)}
                </p>
                <p className="text-lg text-fids-text-secondary">
                  Next page in {settings.pageInterval - (Math.floor(Date.now() / 1000) % settings.pageInterval)} seconds
                </p>
              </div>
            )}
          </div>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-24 w-24 text-fids-text-secondary mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-fids-text mb-4">No Upcoming Flights</h3>
            <p className="text-xl text-fids-text-secondary">
              No {displayType} flights scheduled in the next 3 hours
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {flights
              .slice(currentPage * settings.flightsPerPage, (currentPage + 1) * settings.flightsPerPage)
              .map((flight) => (
              <div
                key={flight.id}
                className="bg-fids-card border border-fids-border rounded-lg p-4 hover:bg-fids-card-hover transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Flight Number & Airline */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Hash className="h-5 w-5 text-fids-accent" />
                      <span className="text-xl font-bold text-fids-accent">{flight.flight_number}</span>
                    </div>
                    <p className="text-base font-medium text-fids-text">{flight.airline}</p>
                    {flight.aircraft_type && (
                      <p className="text-sm text-fids-text-secondary">{flight.aircraft_type}</p>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="h-5 w-5 text-fids-accent" />
                      <span className="text-base font-medium text-fids-text-secondary">To</span>
                    </div>
                    <p className="text-xl font-bold text-fids-text">{flight.destination || 'TBA'}</p>
                  </div>

                  {/* Scheduled Time */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-5 w-5 text-fids-accent" />
                      <span className="text-base font-medium text-fids-text-secondary">Scheduled</span>
                    </div>
                    <p className="text-xl font-bold text-fids-text">
                      {formatTime(flight.scheduled_departure)}
                    </p>
                    <p className="text-sm text-fids-text-secondary">
                      {formatDate(flight.scheduled_departure)}
                    </p>
                  </div>

                  {/* Actual Time */}
                  <div className="col-span-2">
                    <div className="mb-1">
                      <span className="text-base font-medium text-fids-text-secondary">Actual</span>
                    </div>
                    <p className="text-xl font-bold text-fids-text">
                      {formatTime(flight.actual_departure)}
                    </p>
                  </div>

                  {/* Gate & Terminal */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building className="h-5 w-5 text-fids-accent" />
                      <span className="text-base font-medium text-fids-text-secondary">Gate</span>
                    </div>
                    <p className="text-xl font-bold text-fids-text">{flight.gate || 'TBA'}</p>
                    {flight.terminal && (
                      <p className="text-sm text-fids-text-secondary">Terminal {flight.terminal}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 text-right">
                    <StatusBadge status={flight.status} className="text-lg px-3 py-1" />
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
                Press 'A' for admin | 'D' for domestic | 'I' for international
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FidsDisplay;