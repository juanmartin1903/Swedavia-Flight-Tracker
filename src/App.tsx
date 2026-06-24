/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Map, Activity, LayoutDashboard, Settings, AlertCircle, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { SWEDAVIA_AIRPORTS, type Airport, type Flight } from './types';
import FlightList from './components/FlightList';
import DestinationOverview from './components/DestinationOverview';

export default function App() {
  const [activeTab, setActiveTab] = useState<'flights' | 'destinations'>('flights');
  const [viewMode, setViewMode] = useState<'cards' | 'tags'>('cards');
  const [selectedAirport, setSelectedAirport] = useState<Airport>(SWEDAVIA_AIRPORTS[0]);
  const [healthStatus, setHealthStatus] = useState<{ status: string; apiConfigured: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      console.error('Health check failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-blue-100">
      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white border-r border-slate-200 z-50 transition-all duration-300">
        <div className="p-6 mb-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Plane className="text-white w-6 h-6 rotate-45" />
          </div>
          <h1 className="hidden md:block font-bold text-xl tracking-tight text-slate-800">
            Swedavia<span className="text-blue-600">Track</span>
          </h1>
        </div>

        <div className="px-3 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Live Flights" 
            active={activeTab === 'flights'} 
            onClick={() => setActiveTab('flights')} 
          />
          <NavItem 
            icon={<Map size={20} />} 
            label="Destinations" 
            active={activeTab === 'destinations'} 
            onClick={() => setActiveTab('destinations')} 
          />
        </div>

        <div className="absolute bottom-6 w-full px-3">
          <div className="bg-slate-50 p-4 rounded-2xl md:block hidden border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Status</span>
              {healthStatus?.apiConfigured ? (
                <CheckCircle2 className="text-emerald-500 w-4 h-4" />
              ) : (
                <Activity className="text-amber-500 w-4 h-4 animate-pulse" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {healthStatus?.apiConfigured ? 'Connected to Swedavia v2' : 'API Key Required'}
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pl-20 md:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select 
              value={selectedAirport.iata}
              onChange={(e) => {
                const airport = SWEDAVIA_AIRPORTS.find(a => a.iata === e.target.value);
                if (airport) setSelectedAirport(airport);
              }}
              className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none cursor-pointer"
            >
              {SWEDAVIA_AIRPORTS.map(a => (
                <option key={a.iata} value={a.iata}>{a.name} ({a.iata})</option>
              ))}
            </select>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
              <Activity size={14} className="text-blue-500" />
              Refreshing every 60s
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
               <button 
                 onClick={() => setViewMode('cards')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Cards
               </button>
               <button 
                 onClick={() => setViewMode('tags')}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'tags' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Nametags
               </button>
             </div>

             {!healthStatus?.apiConfigured && (
               <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-semibold border border-amber-100">
                 <AlertCircle size={14} />
                 <span>Developer Mode: API Key Missing</span>
               </div>
             )}
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedAirport.iata}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'flights' ? (
                <FlightList airport={selectedAirport} viewMode={viewMode} />
              ) : (
                <DestinationOverview viewMode={viewMode} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
        active 
          ? 'bg-blue-50 text-blue-600 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <span className={`${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
        {icon}
      </span>
      <span className="hidden md:block font-medium text-sm">{label}</span>
      {active && <ChevronRight size={14} className="hidden md:block ml-auto text-blue-400" />}
    </button>
  );
}
