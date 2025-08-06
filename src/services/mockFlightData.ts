import { Flight } from "@/types/flight";
import { addMinutes, addHours, format } from "date-fns";

// Mock airlines and destinations
const airlines = [
  "Air India", "IndiGo", "SpiceJet", "Vistara", "GoAir", "AirAsia India",
  "Emirates", "Qatar Airways", "Singapore Airlines", "British Airways",
  "Lufthansa", "Turkish Airlines", "Thai Airways", "Malaysia Airlines"
];

const destinations = [
  "Mumbai (BOM)", "Delhi (DEL)", "Bangalore (BLR)", "Hyderabad (HYD)",
  "Kolkata (CCU)", "Pune (PNQ)", "Ahmedabad (AMD)", "Goa (GOI)",
  "Dubai (DXB)", "Singapore (SIN)", "Kuala Lumpur (KUL)", "Bangkok (BKK)",
  "London (LHR)", "Frankfurt (FRA)", "Paris (CDG)", "Amsterdam (AMS)"
];

const aircraftTypes = [
  "A320", "A321", "A330", "A350", "B737", "B777", "B787", "ATR 72", "Q400"
];

const statuses: Flight['status'][] = [
  'on-time', 'on-time', 'on-time', 'boarding', 'delayed', 'scheduled', 'cancelled'
];

const gates = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2"];
const terminals = ["1", "2", "3"];

export function generateMockFlights(count: number = 15): Flight[] {
  const flights: Flight[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const scheduledDeparture = addMinutes(now, Math.random() * 180); // Next 3 hours
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate actual departure based on status
    let actualDeparture: string | undefined;
    if (status === 'delayed') {
      actualDeparture = addMinutes(scheduledDeparture, 15 + Math.random() * 45).toISOString();
    } else if (status === 'on-time' || status === 'boarding') {
      actualDeparture = scheduledDeparture.toISOString();
    }

    const flightNumber = `${airlines[Math.floor(Math.random() * airlines.length)].split(' ')[0].slice(0, 2).toUpperCase()}${String(Math.floor(Math.random() * 9000) + 1000)}`;
    
    const flight: Flight = {
      id: `mock-${i + 1}`,
      flight_number: flightNumber,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      aircraft_type: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      origin: "Chennai (MAA)",
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      scheduled_departure: scheduledDeparture.toISOString(),
      scheduled_arrival: addHours(scheduledDeparture, 1 + Math.random() * 8).toISOString(),
      actual_departure: actualDeparture,
      actual_arrival: undefined,
      gate: status === 'cancelled' ? undefined : gates[Math.floor(Math.random() * gates.length)],
      terminal: terminals[Math.floor(Math.random() * terminals.length)],
      status,
      flight_type: 'departure',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    flights.push(flight);
  }

  return flights.sort((a, b) => 
    new Date(a.scheduled_departure!).getTime() - new Date(b.scheduled_departure!).getTime()
  );
}

export const mockFlightService = {
  async getUpcomingDepartures(): Promise<Flight[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    return generateMockFlights();
  }
};