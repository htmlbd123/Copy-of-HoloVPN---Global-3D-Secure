import React, { useEffect, useState } from 'react';
import { Activity, Shield, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { VPNState, ConnectionStatus, ServerNode } from '../types';

interface StatusPanelProps {
  status: ConnectionStatus;
  vpnState: VPNState;
  currentServer: ServerNode | undefined;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ status, vpnState, currentServer }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (status === ConnectionStatus.CONNECTED && vpnState.startTime) {
      interval = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - vpnState.startTime!) / 1000));
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, vpnState.startTime]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full bg-cyber-glass border border-cyber-border/30 backdrop-blur-md rounded-xl p-6 flex flex-col gap-6 text-white shadow-[0_0_20px_rgba(0,243,255,0.1)]">
      
      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-red-500'}`} />
          <span className="font-display text-xl font-bold tracking-wider">
            {status === ConnectionStatus.CONNECTED ? 'SECURE' : 'UNSECURE'}
          </span>
        </div>
        <Shield className={`w-5 h-5 ${status === ConnectionStatus.CONNECTED ? 'text-green-400' : 'text-gray-500'}`} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="bg-cyber-dark/50 p-3 rounded border border-white/5">
          <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Globe size={12} /> VIRTUAL IP</div>
          <div className="font-mono text-sm text-cyber-primary">
            {status === ConnectionStatus.CONNECTED ? `192.168.4.${Math.floor(Math.random() * 255)}` : '---.---.---.---'}
          </div>
        </div>

        <div className="bg-cyber-dark/50 p-3 rounded border border-white/5">
          <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Shield size={12} className="text-green-400" /> AD BLOCK</div>
          <div className="font-mono text-sm text-green-400">
            {status === ConnectionStatus.CONNECTED ? `${vpnState.adsBlocked} BLOCKED` : 'INACTIVE'}
          </div>
        </div>

        <div className="bg-cyber-dark/50 p-3 rounded border border-white/5 col-span-2">
          <div className="text-gray-400 text-xs mb-1">SESSION DURATION</div>
          <div className="font-mono text-2xl text-white">{formatTime(duration)}</div>
        </div>

        <div className="bg-cyber-dark/50 p-3 rounded border border-white/5 flex items-center justify-between">
          <div className="text-gray-400 text-xs"><ArrowDown size={14} className="mb-1" /> DOWN</div>
          <div className="font-mono text-sm">{status === ConnectionStatus.CONNECTED ? formatBytes(vpnState.bytesDown) : '0 KB'}</div>
        </div>

        <div className="bg-cyber-dark/50 p-3 rounded border border-white/5 flex items-center justify-between">
          <div className="text-gray-400 text-xs"><ArrowUp size={14} className="mb-1" /> UP</div>
          <div className="font-mono text-sm">{status === ConnectionStatus.CONNECTED ? formatBytes(vpnState.bytesUp) : '0 KB'}</div>
        </div>
      </div>

      {/* Server Info */}
      {currentServer && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-gray-500 mb-1">CONNECTED TO</div>
          <div className="text-lg font-display font-bold text-white flex items-center gap-2">
            <img 
              src={`https://flagcdn.com/24x18/${currentServer.countryCode.toLowerCase()}.png`} 
              alt="flag" 
              className="w-5 h-4 rounded-sm"
            />
            {currentServer.city.toUpperCase()}, {currentServer.countryCode}
          </div>
        </div>
      )}
    </div>
  );
};