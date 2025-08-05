import { Card, CardContent } from "@/components/ui/card";
import { Flight } from "@/types/flight";
import StatusBadge from "./StatusBadge";
import { Plane, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface FlightCardProps {
  flight: Flight;
  onClick?: () => void;
}

const FlightCard = ({ flight, onClick }: FlightCardProps) => {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "TBD";
    return format(new Date(dateString), "HH:mm");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    return format(new Date(dateString), "dd MMM");
  };

  const isArrival = flight.flight_type === 'arrival';
  const scheduledTime = isArrival ? flight.scheduled_arrival : flight.scheduled_departure;
  const actualTime = isArrival ? flight.actual_arrival : flight.actual_departure;
  const location = isArrival ? flight.origin : flight.destination;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Plane className={`h-4 w-4 text-primary ${isArrival ? 'rotate-180' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{flight.flight_number}</h3>
              <p className="text-sm text-muted-foreground">{flight.airline}</p>
            </div>
          </div>
          <StatusBadge status={flight.status} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatTime(scheduledTime)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(scheduledTime)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{location || "TBD"}</p>
              <p className="text-xs text-muted-foreground">
                {isArrival ? "From" : "To"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Gate: <span className="font-medium text-foreground">{flight.gate || "TBD"}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Terminal: <span className="font-medium text-foreground">{flight.terminal || "TBD"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightCard;