import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/types/flight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FlightCard from "@/components/FlightCard";
import { ArrowUp, ArrowDown, Clock, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [upcomingFlights, setUpcomingFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState({
    totalDepartures: 0,
    totalArrivals: 0,
    onTimeFlights: 0,
    delayedFlights: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get flights for next 2 hours
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('flights')
        .select('*')
        .or(`scheduled_departure.gte.${now.toISOString()},scheduled_arrival.gte.${now.toISOString()}`)
        .or(`scheduled_departure.lte.${twoHoursLater.toISOString()},scheduled_arrival.lte.${twoHoursLater.toISOString()}`)
        .order('scheduled_departure', { ascending: true });

      if (upcomingError) throw upcomingError;

      // Get all flights for stats
      const { data: allFlights, error: statsError } = await supabase
        .from('flights')
        .select('*');

      if (statsError) throw statsError;

      setUpcomingFlights((upcomingData || []) as Flight[]);
      
      // Calculate stats
      const departures = allFlights?.filter(f => f.flight_type === 'departure').length || 0;
      const arrivals = allFlights?.filter(f => f.flight_type === 'arrival').length || 0;
      const onTime = allFlights?.filter(f => f.status === 'on-time' || f.status === 'scheduled').length || 0;
      const delayed = allFlights?.filter(f => f.status === 'delayed').length || 0;

      setStats({
        totalDepartures: departures,
        totalArrivals: arrivals,
        onTimeFlights: onTime,
        delayedFlights: delayed
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Chennai Airport Flight Information Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Departures</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalDepartures}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Arrivals</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalArrivals}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Time</p>
                <p className="text-3xl font-bold text-status-on-time">{stats.onTimeFlights}</p>
              </div>
              <Clock className="h-8 w-8 text-status-on-time" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-3xl font-bold text-status-delayed">{stats.delayedFlights}</p>
              </div>
              <Plane className="h-8 w-8 text-status-delayed" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Flights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Upcoming Flights (Next 2 Hours)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingFlights.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming flights in the next 2 hours</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingFlights.slice(0, 6).map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;