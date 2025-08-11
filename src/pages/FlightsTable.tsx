import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flight } from "@/types/flight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import FlightEditForm from "@/components/FlightEditForm";
import { Search, Filter, Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const FlightsTable = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    filterFlights();
  }, [flights, searchTerm, statusFilter, typeFilter]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .order('scheduled_departure', { ascending: true });

      if (error) throw error;
      setFlights((data || []) as Flight[]);
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast({
        title: "Error",
        description: "Failed to load flights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFlights = () => {
    let filtered = [...flights];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(flight =>
        flight.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (flight.origin && flight.origin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (flight.destination && flight.destination.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(flight => flight.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(flight => flight.flight_type === typeFilter);
    }

    setFilteredFlights(filtered);
  };

  const handleEditFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsEditDialogOpen(true);
  };

  const handleFlightUpdated = () => {
    fetchFlights();
    setIsEditDialogOpen(false);
    setSelectedFlight(null);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "TBD";
    return format(new Date(dateString), "HH:mm dd/MM");
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Flight Information</h2>
        <p className="text-muted-foreground">Complete list of all flights</p>
      </div>

      {/* Filters */}
      <Card className="hover-scale animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="boarding">Boarding</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="departed">Departed</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="on-time">On Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="departure">Departures</SelectItem>
                <SelectItem value="arrival">Arrivals</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchFlights} variant="outline" className="hover-scale">
              <Plane className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flights Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead>Terminal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow 
                    key={flight.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors animate-fade-in"
                    onClick={() => handleEditFlight(flight)}
                  >
                    <TableCell className="font-medium">{flight.flight_number}</TableCell>
                    <TableCell>{flight.airline}</TableCell>
                    <TableCell className="capitalize">{flight.flight_type}</TableCell>
                    <TableCell>
                      {flight.flight_type === 'departure' 
                        ? `${flight.origin} → ${flight.destination}`
                        : `${flight.origin} → ${flight.destination}`
                      }
                    </TableCell>
                    <TableCell>
                      {formatTime(flight.flight_type === 'departure' 
                        ? flight.scheduled_departure 
                        : flight.scheduled_arrival
                      )}
                    </TableCell>
                    <TableCell>{flight.gate || "TBD"}</TableCell>
                    <TableCell>{flight.terminal || "TBD"}</TableCell>
                    <TableCell>
                      <StatusBadge status={flight.status} />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFlight(flight);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredFlights.length === 0 && (
            <div className="text-center py-12">
              <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No flights found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Flight: {selectedFlight?.flight_number}</DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <FlightEditForm 
              flight={selectedFlight} 
              onSuccess={handleFlightUpdated}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightsTable;