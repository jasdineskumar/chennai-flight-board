export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  aircraft_type?: string;
  origin?: string;
  destination?: string;
  scheduled_departure?: string;
  scheduled_arrival?: string;
  actual_departure?: string;
  actual_arrival?: string;
  gate?: string;
  terminal?: string;
  status: 'scheduled' | 'boarding' | 'delayed' | 'cancelled' | 'departed' | 'arrived' | 'on-time';
  flight_type: 'departure' | 'arrival';
  created_at: string;
  updated_at: string;
}

export interface FlightFormData {
  flight_number: string;
  airline: string;
  aircraft_type?: string;
  origin?: string;
  destination?: string;
  scheduled_departure?: string;
  scheduled_arrival?: string;
  gate?: string;
  terminal?: string;
  status: string;
  flight_type: 'departure' | 'arrival';
}