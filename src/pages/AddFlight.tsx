import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FlightFormData } from "@/types/flight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddFlight = () => {
  const [formData, setFormData] = useState<FlightFormData>({
    flight_number: "",
    airline: "",
    aircraft_type: "",
    origin: "",
    destination: "",
    scheduled_departure: "",
    scheduled_arrival: "",
    gate: "",
    terminal: "",
    status: "scheduled",
    flight_type: "departure",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof FlightFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.flight_number || !formData.airline || !formData.flight_type) {
        throw new Error("Please fill in all required fields");
      }

      const insertData = {
        ...formData,
        scheduled_departure: formData.scheduled_departure ? new Date(formData.scheduled_departure).toISOString() : null,
        scheduled_arrival: formData.scheduled_arrival ? new Date(formData.scheduled_arrival).toISOString() : null,
        aircraft_type: formData.aircraft_type || null,
        origin: formData.origin || null,
        destination: formData.destination || null,
        gate: formData.gate || null,
        terminal: formData.terminal || null,
      };

      const { error } = await supabase
        .from('flights')
        .insert([insertData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flight added successfully",
      });

      // Reset form
      setFormData({
        flight_number: "",
        airline: "",
        aircraft_type: "",
        origin: "",
        destination: "",
        scheduled_departure: "",
        scheduled_arrival: "",
        gate: "",
        terminal: "",
        status: "scheduled",
        flight_type: "departure",
      });

      // Navigate to flights table
      navigate("/flights");
    } catch (error: any) {
      console.error('Error adding flight:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add flight",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Add New Flight</h2>
        <p className="text-muted-foreground">Enter flight information to add to the system</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span>Flight Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flight_number">Flight Number *</Label>
                <Input
                  id="flight_number"
                  value={formData.flight_number}
                  onChange={(e) => handleInputChange('flight_number', e.target.value)}
                  required
                  placeholder="e.g., AI440"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="airline">Airline *</Label>
                <Input
                  id="airline"
                  value={formData.airline}
                  onChange={(e) => handleInputChange('airline', e.target.value)}
                  required
                  placeholder="e.g., Air India"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aircraft_type">Aircraft Type</Label>
                <Input
                  id="aircraft_type"
                  value={formData.aircraft_type}
                  onChange={(e) => handleInputChange('aircraft_type', e.target.value)}
                  placeholder="e.g., A320"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight_type">Flight Type *</Label>
                <Select value={formData.flight_type} onValueChange={(value) => handleInputChange('flight_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="departure">Departure</SelectItem>
                    <SelectItem value="arrival">Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="e.g., Chennai (MAA)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="e.g., Delhi (DEL)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_departure">Scheduled Departure</Label>
                <Input
                  id="scheduled_departure"
                  type="datetime-local"
                  value={formData.scheduled_departure}
                  onChange={(e) => handleInputChange('scheduled_departure', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_arrival">Scheduled Arrival</Label>
                <Input
                  id="scheduled_arrival"
                  type="datetime-local"
                  value={formData.scheduled_arrival}
                  onChange={(e) => handleInputChange('scheduled_arrival', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gate">Gate</Label>
                <Input
                  id="gate"
                  value={formData.gate}
                  onChange={(e) => handleInputChange('gate', e.target.value)}
                  placeholder="e.g., A12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminal">Terminal</Label>
                <Input
                  id="terminal"
                  value={formData.terminal}
                  onChange={(e) => handleInputChange('terminal', e.target.value)}
                  placeholder="e.g., T1"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="boarding">Boarding</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="departed">Departed</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="on-time">On Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/flights")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Flight..." : "Add Flight"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddFlight;