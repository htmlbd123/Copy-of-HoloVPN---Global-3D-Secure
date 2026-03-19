import React, { useEffect, useState } from 'react';
import { ShieldAlert, Terminal, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { ServerNode } from '../types';
import { getSecurityBriefing } from '../services/geminiService';

interface ThreatPanelProps {
  connectedServer: ServerNode;
}

interface ThreatLog {
  id: number;
  ip: string;
  type: string;
  timestamp: string;
}

const THREAT_TYPES = ['SQL Injection', 'XSS Attempt', 'Port Scan', 'Malware Sig', 'Botnet Ping', 'Packet Sniff'];

export const ThreatPanel: React.FC<ThreatPanelProps> = ({ connectedServer }) => {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [briefing, setBriefing] = useState<{ threatLevel: string; briefing: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch AI Briefing
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setBriefing(null);
    
    getSecurityBriefing(connectedServer.city, connectedServer.country)
      .then(data => {
        if (mounted && data) {
          setBriefing(data);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [connectedServer.id]);

  // Simulate Live Threat Logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        ip: `192.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x`,
        type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
        timestamp: new Date().toLocaleTimeString()
      };
      setLogs(prev => [newLog, ...prev].slice(0, 5)); // Keep last 5
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/80 backdrop-blur-md border border-red-500/30 p-4 rounded-xl w-80 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col gap-4 font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
        <div className="flex items-center gap-2 text-red-400">
          <ShieldAlert size={18} />
          <span className="font-bold text-sm tracking-wider">HOLOGUARD ACTIVE</span>
        </div>
        <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full" />
      </div>

      {/* AI Security Briefing */}
      <div className="bg-red-950/30 p-3 rounded border border-red-500/20">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Loader2 className="animate-spin" size={12} />
            ANALYZING REGION SECURITY...
          </div>
        ) : briefing ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">THREAT LEVEL</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                briefing.threatLevel === 'CRITICAL' ? 'bg-red-500 text-black' : 
                briefing.threatLevel === 'MODERATE' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'
              }`}>
                {briefing.threatLevel}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {briefing.briefing}
            </p>
          </>
        ) : (
           <div className="text-xs text-gray-500">No intelligence data available.</div>
        )}
      </div>

      {/* Terminal Logs */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-gray-500 text-xs uppercase tracking-widest">
          <Terminal size={10} />
          Live Intercept Log
        </div>
        <div className="h-32 overflow-hidden relative">
           {/* Scanline effect */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-20"></div>
           
           <div className="flex flex-col gap-1">
             {logs.map(log => (
               <div key={log.id} className="text-[10px] flex items-center justify-between text-gray-300 animate-in slide-in-from-left-2 fade-in duration-300">
                 <span className="text-red-400/80">[{log.timestamp}]</span>
                 <span>{log.type}</span>
                 <span className="text-gray-600">{log.ip}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="text-[10px] text-center text-red-500/50 mt-1">
        SYSTEM INTEGRITY: 100%
      </div>
    </div>
  );
};
