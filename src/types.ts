export interface Flight {
  flightId: string;
  flightNumber: string;
  departureTime?: string;
  arrivalTime?: string;
  destination?: string;
  origin?: string;
  status: string;
  gate?: string;
  checkInCounter?: string;
  airline: string;
  airport: string;
}

export interface Airport {
  iata: string;
  name: string;
  location: string;
}

export interface Destination {
  city: string;
  country: string;
}

export const SWEDAVIA_AIRPORTS: Airport[] = [
  { iata: 'ARN', name: 'Stockholm Arlanda', location: 'Stockholm' },
  { iata: 'GOT', name: 'Göteborg Landvetter', location: 'Gothenburg' },
  { iata: 'BMA', name: 'Stockholm Bromma', location: 'Stockholm' },
  { iata: 'MMX', name: 'Malmö Airport', location: 'Malmö' },
  { iata: 'LLA', name: 'Luleå Airport', location: 'Luleå' },
  { iata: 'UME', name: 'Umeå Airport', location: 'Umeå' },
  { iata: 'OSD', name: 'Åre Östersund', location: 'Östersund' },
  { iata: 'VBY', name: 'Visby Airport', location: 'Visby' },
  { iata: 'RNB', name: 'Ronneby Airport', location: 'Ronneby' },
  { iata: 'KRN', name: 'Kiruna Airport', location: 'Kiruna' },
];
