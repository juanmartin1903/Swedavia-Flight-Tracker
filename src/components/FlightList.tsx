import { useState, useEffect } from 'react';
import { Plane, Search, Clock, MapPin, Hash, Briefcase, Filter, RefreshCcw, AlertTriangle } from 'lucide-react';
import type { Airport, Flight } from '../types';

interface FlightListProps {
  airport: Airport;
}

export default function FlightList({ airport }: FlightListProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [odataFilter, setOdataFilter] = useState('');

  useEffect(() => {
    fetchFlights();
  }, [airport]);

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const odataQuery = odataFilter ? `odata=$filter=contains(flightNumber,'${odataFilter}')` : '';
      const response = await fetch(`/api/flights/${airport.iata}${odataQuery ? `?${odataQuery}` : ''}`);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch flights');
      }
      
      const data = await response.json();
      // Swedavia API returns flights in a specific structure, mapping it here
      const mappedFlights = (data.flights || []).map((f: any) => ({
        flightId: f.flightId,
        flightNumber: f.flightNumber,
        departureTime: f.departureTime?.scheduled,
        destination: f.arrivalAirport?.city,
        status: f.status?.state || 'Scheduled',
        gate: f.location?.gate,
        airline: f.airline?.name,
        airport: airport.iata
      }));
      
      setFlights(mappedFlights);
    } catch (err: any) {
      setError(err.message);
      // Fallback mock data if API key is missing for preview visibility
      if (err.message.includes('API_KEY')) {
        setFlights(generateMockFlights(airport.iata));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFlights = flights.filter(f => 
    f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.airline?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search destination, airline or flight ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchFlights}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && !error.includes('API_KEY') && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredFlights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlights.map((flight) => (
            <div 
              key={flight.flightId + flight.flightNumber} 
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{flight.flightNumber}</h3>
                  <span className="text-xs font-medium text-slate-400 capitalize">{flight.airline}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(flight.status)}`}>
                  {flight.status}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="font-medium">{flight.destination || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock size={16} className="text-slate-400" />
                  <span>{flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Hash size={16} className="text-slate-400" />
                  <span>Gate {flight.gate || 'TBD'}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">IATA: {flight.airport}</span>
                <button className="text-blue-600 text-xs font-bold hover:underline">View Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Plane size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No flights found matching criteria</p>
          <button 
             onClick={() => { setSearchTerm(''); setOdataFilter(''); fetchFlights(); }}
             className="mt-4 text-blue-600 font-medium text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes('expected') || s.includes('ontime') || s.includes('scheduled')) return 'bg-emerald-50 text-emerald-600';
  if (s.includes('late') || s.includes('delayed')) return 'bg-amber-50 text-amber-600';
  if (s.includes('cancelled') || s.includes('gate closed')) return 'bg-rose-50 text-rose-600';
  return 'bg-blue-50 text-blue-600';
}

function generateMockFlights(airport: string): Flight[] {
  return [
    { flightId: 'm1', flightNumber: 'SK1422', airline: 'SAS', destination: 'Stockholm', status: 'On Time', gate: '12', airport, departureTime: new Date().toISOString() },
    { flightId: 'm2', flightNumber: 'DY4412', airline: 'Norwegian', destination: 'Oslo', status: 'Delayed', gate: '04', airport, departureTime: new Date(Date.now() + 1800000).toISOString() },
    { flightId: 'm3', flightNumber: 'LH2415', airline: 'Lufthansa', destination: 'Frankfurt', status: 'Scheduled', gate: 'B2', airport, departureTime: new Date(Date.now() + 3600000).toISOString() },
    { flightId: 'm4', flightNumber: 'FR124', airline: 'Ryanair', destination: 'London Stansted', status: 'Expected', gate: '22', airport, departureTime: new Date(Date.now() + 7200000).toISOString() },
    { flightId: 'm5', flightNumber: 'AF1063', airline: 'Air France', destination: 'Paris CDG', status: 'Gate Closed', gate: '19', airport, departureTime: new Date(Date.now() - 600000).toISOString() },
  ];
}
