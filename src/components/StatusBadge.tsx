import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on-time':
      case 'scheduled':
        return "bg-status-on-time text-status-on-time-foreground hover:bg-status-on-time/80";
      case 'delayed':
        return "bg-status-delayed text-status-delayed-foreground hover:bg-status-delayed/80";
      case 'cancelled':
        return "bg-status-cancelled text-status-cancelled-foreground hover:bg-status-cancelled/80";
      case 'boarding':
        return "bg-status-boarding text-status-boarding-foreground hover:bg-status-boarding/80";
      case 'arrived':
      case 'departed':
        return "bg-status-arrived text-status-arrived-foreground hover:bg-status-arrived/80";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Badge 
      className={cn(getStatusStyle(status), "font-medium", className)}
    >
      {formatStatus(status)}
    </Badge>
  );
};

export default StatusBadge;