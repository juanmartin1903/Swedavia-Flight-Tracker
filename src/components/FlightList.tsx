import { useState, useEffect } from 'react';
import { Plane, Search, Clock, MapPin, Hash, Briefcase, Filter, RefreshCcw, AlertTriangle } from 'lucide-react';
import type { Airport, Flight } from '../types';

interface FlightListProps {
  airport: Airport;
  viewMode: 'cards' | 'tags';
}

export default function FlightList({ airport, viewMode }: FlightListProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [odataFilter, setOdataFilter] = useState('');
  const [flightType, setFlightType] = useState<'arrivals' | 'departures'>('departures');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, [airport, flightType]);

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const odataQuery = odataFilter ? `odata=$filter=contains(flightNumber,'${odataFilter}')` : '';
      const response = await fetch(`/api/flights/${airport.iata}/${flightType}${odataQuery ? `?${odataQuery}` : ''}`);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch flights');
      }
      
      const data = await response.json();
      
      // Swedavia API returns flights in a specific structure
      const rawFlights = data.flights || [];
      const mappedFlights = rawFlights.map((f: any) => {
        const airline = f.airlineOperator?.name || f.airline?.name || 'N/A';
        const flightNumber = f.flightId || f.flightNumber || 'N/A';
        const dest = f.arrivalAirportEnglish || f.arrivalAirport?.city || f.departureAirportEnglish || f.departureAirport?.city || 'N/A';
        const time = f.departureTime?.scheduledUtc || f.departureTime?.scheduled || 
                     f.arrivalTime?.scheduledUtc || f.arrivalTime?.scheduled || null;
        const status = f.locationAndStatus?.flightLegStatusEnglish || f.status?.state || 'Scheduled';
        const gate = f.locationAndStatus?.gate || f.location?.gate || 'TBD';

        return {
          flightId: f.flightId || Math.random().toString(),
          flightNumber,
          departureTime: time,
          destination: dest,
          status,
          gate,
          airline,
          airport: airport.iata
        };
      });
      
      setFlights(mappedFlights);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('API_KEY') || err.message.includes('not found')) {
        setFlights(generateMockFlights(airport.iata, flightType));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFlights = flights
    .filter(f => {
      const s = (f.status || '').toLowerCase();
      // Only show: active, arriving, departing, canceled, delayed, boarding
      const isRelevant = s.includes('arr') || 
                         s.includes('dep') || 
                         s.includes('canc') || 
                         s.includes('delay') || 
                         s.includes('late') ||
                         s.includes('expect') || 
                         s.includes('gate') || 
                         s.includes('board') ||
                         s.includes('onboard') ||
                         s.includes('sch') ||
                         s.includes('time');
      
      if (!isRelevant) return false;

      // History Filter: No more than 2 hours earlier
      if (f.departureTime) {
        const flightDate = new Date(f.departureTime);
        const now = new Date();
        const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        
        if (!showHistory && flightDate < fifteenMinsAgo) return false;
        if (showHistory && flightDate < twoHoursAgo) return false;
      }

      const matchSearch = (f.flightNumber || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                          (f.destination || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                          (f.airline || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      
      return matchSearch;
    })
    .sort((a, b) => {
      const timeA = a.departureTime ? new Date(a.departureTime).getTime() : 0;
      const timeB = b.departureTime ? new Date(b.departureTime).getTime() : 0;
      return timeA - timeB;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setFlightType('departures')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${flightType === 'departures' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Departures
            </button>
            <button 
              onClick={() => setFlightType('arrivals')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${flightType === 'arrivals' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Arrivals
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div 
              onClick={() => setShowHistory(!showHistory)}
              className={`w-10 h-5 rounded-full transition-all relative ${showHistory ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${showHistory ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700">History (-2h)</span>
          </label>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder={`Search ${flightType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3">
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

      {error && !error.includes('API_KEY') && !error.includes('Resource not found') && (
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
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlights.map((flight, index) => (
              <div 
                key={`${flight.flightId}-${flight.flightNumber}-${flight.departureTime}-${index}`} 
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
          <div className="flex flex-wrap gap-3">
            {filteredFlights.map((flight, index) => (
              <div 
                key={`${flight.flightId}-${flight.flightNumber}-${flight.departureTime}-${index}-tag`} 
                className="flex items-center gap-4 bg-slate-900 text-slate-100 px-4 py-2.5 rounded-lg border border-slate-700 font-mono text-xs hover:border-blue-500 transition-colors cursor-pointer group shadow-lg"
              >
                <div className="flex flex-col border-r border-slate-700 pr-4 mr-1">
                  <span className="text-[10px] text-blue-400 font-bold tracking-widest">{flight.flightNumber}</span>
                  <span className="text-slate-500 text-[8px] uppercase tracking-tighter">{flight.status || 'Scheduled'}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-[10px]">{flight.destination || 'N/A'}</span>
                    <span className="text-slate-600 text-[8px] italic tracking-tight">{flight.airline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 uppercase">
                    <span>GATE: {flight.gate || 'TBD'}</span>
                    <span className="text-slate-700">|</span>
                    <span>{flight.departureTime ? new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                  </div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(flight.status)} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
              </div>
            ))}
          </div>
        )
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
  const s = (status || '').toLowerCase();
  if (s.includes('board') || s.includes('onboard') || s.includes('gate open') || s.includes('sch') || s.includes('time')) return 'bg-emerald-50 text-emerald-600';
  if (s.includes('late') || s.includes('delay')) return 'bg-amber-50 text-amber-600';
  if (s.includes('canc')) return 'bg-rose-50 text-rose-600';
  if (s.includes('dep') || s.includes('arr') || s.includes('landed')) return 'bg-blue-50 text-blue-600';
  return 'bg-slate-50 text-slate-500';
}

function getStatusDotColor(status: string) {
  const s = (status || '').toLowerCase();
  if (s.includes('board') || s.includes('onboard') || s.includes('sch') || s.includes('time')) return 'bg-emerald-400';
  if (s.includes('late') || s.includes('delay')) return 'bg-amber-400';
  if (s.includes('canc')) return 'bg-rose-400';
  if (s.includes('dep') || s.includes('arr')) return 'bg-blue-400';
  return 'bg-slate-400';
}

function generateMockFlights(airport: string, type: 'arrivals' | 'departures'): Flight[] {
  const suffix = type === 'arrivals' ? ' (Arr)' : '';
  return [
    { flightId: 'm1', flightNumber: 'SK1422', airline: 'SAS', destination: 'Stockholm' + suffix, status: 'On Time', gate: '12', airport, departureTime: new Date().toISOString() },
    { flightId: 'm2', flightNumber: 'DY4412', airline: 'Norwegian', destination: 'Oslo' + suffix, status: 'Delayed', gate: '04', airport, departureTime: new Date(Date.now() + 1800000).toISOString() },
    { flightId: 'm3', flightNumber: 'LH2415', airline: 'Lufthansa', destination: 'Frankfurt' + suffix, status: 'Scheduled', gate: 'B2', airport, departureTime: new Date(Date.now() + 3600000).toISOString() },
    { flightId: 'm4', flightNumber: 'FR124', airline: 'Ryanair', destination: 'London Stansted' + suffix, status: 'Expected', gate: '22', airport, departureTime: new Date(Date.now() + 7200000).toISOString() },
    { flightId: 'm5', flightNumber: 'AF1063', airline: 'Air France', destination: 'Paris CDG' + suffix, status: 'Gate Closed', gate: '19', airport, departureTime: new Date(Date.now() - 600000).toISOString() },
  ];
}
