import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flight, FlightFormData } from "@/types/flight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FlightEditFormProps {
  flight: Flight;
  onSuccess: () => void;
  onCancel: () => void;
}

const FlightEditForm = ({ flight, onSuccess, onCancel }: FlightEditFormProps) => {
  const [formData, setFormData] = useState<FlightFormData>({
    flight_number: flight.flight_number,
    airline: flight.airline,
    aircraft_type: flight.aircraft_type || "",
    origin: flight.origin || "",
    destination: flight.destination || "",
    scheduled_departure: flight.scheduled_departure ? new Date(flight.scheduled_departure).toISOString().slice(0, 16) : "",
    scheduled_arrival: flight.scheduled_arrival ? new Date(flight.scheduled_arrival).toISOString().slice(0, 16) : "",
    gate: flight.gate || "",
    terminal: flight.terminal || "",
    status: flight.status,
    flight_type: flight.flight_type,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FlightFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        ...formData,
        scheduled_departure: formData.scheduled_departure ? new Date(formData.scheduled_departure).toISOString() : null,
        scheduled_arrival: formData.scheduled_arrival ? new Date(formData.scheduled_arrival).toISOString() : null,
      };

      const { error } = await supabase
        .from('flights')
        .update(updateData)
        .eq('id', flight.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flight updated successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating flight:', error);
      toast({
        title: "Error",
        description: "Failed to update flight",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('flights')
        .delete()
        .eq('id', flight.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flight deleted successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error deleting flight:', error);
      toast({
        title: "Error",
        description: "Failed to delete flight",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="status">Status *</Label>
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

          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Flight
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Flight</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete flight {flight.flight_number}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Flight"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FlightEditForm;