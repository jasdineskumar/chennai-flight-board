import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/types/flight";
import StatusBadge from "@/components/StatusBadge";
import { Plane, Clock, MapPin, Hash, Building, Users } from "lucide-react";
import { format, isAfter, isBefore, addHours } from "date-fns";

const FidsDisplay = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');

  const fetchFlights = async () => {
    try {
      setConnectionStatus('connected');
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
  };

  useEffect(() => {
    fetchFlights();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchFlights, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-fids-dark text-fids-text">
      {/* Header */}
      <div className="bg-fids-primary p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Plane className="h-12 w-12 text-white" />
            <div>
              <h1 className="text-4xl font-bold text-white">Chennai Airport</h1>
              <p className="text-xl text-fids-accent font-medium">Flight Information Display</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-white text-lg font-medium">
                {connectionStatus === 'connected' ? 'LIVE' : 
                 connectionStatus === 'error' ? 'ERROR' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-fids-accent text-lg">
              Last Updated: {format(lastUpdated, 'HH:mm:ss')}
            </p>
            <p className="text-white text-lg">
              {format(new Date(), 'dd MMM yyyy, HH:mm')}
            </p>
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
          <p className="text-lg">
            Chennai International Airport - Flight Information Display System
          </p>
          <p className="text-lg">
            Auto-refresh: Every 60 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default FidsDisplay;