-- Create flights table for Chennai Airport FIDS
CREATE TABLE public.flights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_number VARCHAR(10) NOT NULL,
  airline VARCHAR(100) NOT NULL,
  aircraft_type VARCHAR(50),
  origin VARCHAR(100),
  destination VARCHAR(100),
  scheduled_departure TIMESTAMP WITH TIME ZONE,
  scheduled_arrival TIMESTAMP WITH TIME ZONE,
  actual_departure TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  gate VARCHAR(10),
  terminal VARCHAR(5),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  flight_type VARCHAR(10) NOT NULL CHECK (flight_type IN ('departure', 'arrival')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (for future authentication if needed)
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (no auth required initially)
CREATE POLICY "Allow all operations on flights" 
ON public.flights 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_flights_flight_number ON public.flights(flight_number);
CREATE INDEX idx_flights_status ON public.flights(status);
CREATE INDEX idx_flights_scheduled_departure ON public.flights(scheduled_departure);
CREATE INDEX idx_flights_scheduled_arrival ON public.flights(scheduled_arrival);
CREATE INDEX idx_flights_flight_type ON public.flights(flight_type);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for Chennai Airport
INSERT INTO public.flights (flight_number, airline, aircraft_type, origin, destination, scheduled_departure, scheduled_arrival, gate, terminal, status, flight_type) VALUES
-- Departures
('AI440', 'Air India', 'A320', 'Chennai (MAA)', 'Delhi (DEL)', now() + interval '1 hour', now() + interval '3.5 hours', 'A12', 'T1', 'boarding', 'departure'),
('6E2461', 'IndiGo', 'A320neo', 'Chennai (MAA)', 'Mumbai (BOM)', now() + interval '2 hours', now() + interval '4 hours', 'B03', 'T1', 'scheduled', 'departure'),
('SG8162', 'SpiceJet', 'B737', 'Chennai (MAA)', 'Bangalore (BLR)', now() + interval '30 minutes', now() + interval '1.5 hours', 'A08', 'T1', 'delayed', 'departure'),
('UK955', 'Vistara', 'A321', 'Chennai (MAA)', 'Hyderabad (HYD)', now() + interval '3 hours', now() + interval '4 hours', 'B15', 'T1', 'scheduled', 'departure'),
('AI765', 'Air India', 'B777', 'Chennai (MAA)', 'Singapore (SIN)', now() + interval '4 hours', now() + interval '8 hours', 'C01', 'T2', 'scheduled', 'departure'),

-- Arrivals
('AI441', 'Air India', 'A320', 'Delhi (DEL)', 'Chennai (MAA)', now() - interval '30 minutes', now() + interval '15 minutes', 'A05', 'T1', 'arrived', 'arrival'),
('6E2462', 'IndiGo', 'A320neo', 'Mumbai (BOM)', 'Chennai (MAA)', now() + interval '45 minutes', now() + interval '45 minutes', 'B07', 'T1', 'on-time', 'arrival'),
('SG8163', 'SpiceJet', 'B737', 'Bangalore (BLR)', 'Chennai (MAA)', now() + interval '1.5 hours', now() + interval '1.5 hours', 'A10', 'T1', 'scheduled', 'arrival'),
('EK544', 'Emirates', 'B777', 'Dubai (DXB)', 'Chennai (MAA)', now() + interval '2.5 hours', now() + interval '2.5 hours', 'C03', 'T2', 'scheduled', 'arrival'),
('QR544', 'Qatar Airways', 'A350', 'Doha (DOH)', 'Chennai (MAA)', now() + interval '3 hours', now() + interval '3 hours', 'C05', 'T2', 'on-time', 'arrival');