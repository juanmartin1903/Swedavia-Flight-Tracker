import { useState, useEffect, ReactNode } from 'react';
import { Globe, MapPin, BarChart3, PieChart, Users, ArrowUpRight } from 'lucide-react';
import type { Destination } from '../types';

interface DestinationOverviewProps {
  viewMode: 'cards' | 'tags';
}

export default function DestinationOverview({ viewMode }: DestinationOverviewProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [stats, setStats] = useState({ totalCities: 0, totalCountries: 0 });

  useEffect(() => {
    // Load local data (FR-05: Offline Destination Analytics)
    import('../data/city_country.json').then((data) => {
      const uniqueCities = [...new Set(data.default.map(d => d.city))];
      const uniqueCountries = [...new Set(data.default.map(d => d.country))];
      setDestinations(data.default);
      setStats({
        totalCities: uniqueCities.length,
        totalCountries: uniqueCountries.length
      });
    });
  }, []);

  const countryDistribution = destinations.reduce((acc, curr) => {
    acc[curr.country] = (acc[curr.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCountries = Object.entries(countryDistribution)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Globe className="text-blue-600" />} 
            label="Network Reach" 
            value={stats.totalCountries} 
            unit="Countries" 
            trend="+2 New"
          />
          <StatCard 
            icon={<MapPin className="text-emerald-600" />} 
            label="Active Hubs" 
            value={stats.totalCities} 
            unit="Cities" 
            trend="Real-time"
          />
          <StatCard 
            icon={<Users className="text-amber-600" />} 
            label="Avg. Demand" 
            value="High" 
            unit="Traffic" 
            trend="8% Growth"
          />
        </div>
      )}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Country Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" />
                Regional Connectivity
              </h3>
              <span className="text-xs text-slate-400 font-medium tracking-wide bg-slate-50 px-3 py-1 rounded-full uppercase">Aggregation Plan</span>
            </div>

            <div className="space-y-6">
              {sortedCountries.map(([country, count]) => (
                <div key={country} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">{country}</span>
                    <span className="text-slate-800">{count as number} Routes</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${((count as number) / destinations.length) * 100 * 3}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Hubs Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <PieChart size={20} className="text-emerald-500" />
                Primary Hubs
              </h3>
              <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                Audit Data
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {destinations.slice(0, 8).map((dest, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 group-hover:bg-blue-50 transition-colors">
                    <MapPin size={14} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{dest.city}</p>
                    <p className="text-[10px] text-slate-400">{dest.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
             <div className="bg-blue-500/20 p-2 rounded-lg">
                <BarChart3 className="text-blue-400" size={20} />
             </div>
             <h3 className="text-slate-100 font-bold">Network Nametags</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {destinations.map((dest, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 font-mono text-[10px] hover:border-blue-400 hover:text-blue-400 transition-all cursor-default"
              >
                <span className="text-slate-500">CITY//</span>
                <span className="font-bold text-slate-100 uppercase tracking-tight">{dest.city}</span>
                <span className="text-slate-600 mx-1">|</span>
                <span className="text-slate-400">{dest.country}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between text-[10px] font-mono text-slate-500 tracking-widest uppercase">
             <span>Efficiency Layer: Online</span>
             <span>Ref: city_country.json</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, trend }: { icon: ReactNode, label: string, value: string | number, unit: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="mb-4 bg-slate-50 w-fit p-2 rounded-xl border border-slate-100">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl font-black text-slate-800 leading-none">{value}</h4>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{unit}</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
        <span className="text-[10px] text-slate-400 font-medium">period overview</span>
      </div>
    </div>
  );
}
