import React, { useState } from 'react';
import Globe3D from './components/Globe3D';
import { ServerList } from './components/ServerList';
import { StatusPanel } from './components/StatusPanel';
import { SmartRouter } from './components/SmartRouter';
import { ThreatPanel } from './components/ThreatPanel';
import { ConnectionStatus, VPNState } from './types';
import { SERVERS } from './constants';
import { Power } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [selectedServerId, setSelectedServerId] = useState<string | null>('us-ny'); // Default selection
  
  const [vpnState, setVpnState] = useState<VPNState>({
    isConnected: false,
    selectedServerId: 'us-ny',
    connectedServerId: null,
    startTime: null,
    bytesUp: 0,
    bytesDown: 0,
    adsBlocked: 0
  });

  // Simulate stats updates
  React.useEffect(() => {
    let interval: number | undefined;
    if (status === ConnectionStatus.CONNECTED) {
      interval = window.setInterval(() => {
        setVpnState(prev => ({
          ...prev,
          bytesUp: prev.bytesUp + Math.random() * 50,
          bytesDown: prev.bytesDown + Math.random() * 200,
          adsBlocked: prev.adsBlocked + (Math.random() > 0.7 ? 1 : 0)
        }));
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleSelectServer = (id: string) => {
    // If connected, confirm switch? For now, just allow selection change visually unless we enforce disconnect first
    setSelectedServerId(id);
    if (status === ConnectionStatus.DISCONNECTED) {
      // Prepare for connection
    }
  };

  const toggleConnection = () => {
    if (status === ConnectionStatus.DISCONNECTED) {
      if (!selectedServerId) return;
      
      setStatus(ConnectionStatus.CONNECTING);
      
      // Simulate connection delay
      setTimeout(() => {
        setStatus(ConnectionStatus.CONNECTED);
        setVpnState(prev => ({
          ...prev,
          isConnected: true,
          connectedServerId: selectedServerId,
          startTime: Date.now(),
          adsBlocked: 0,
          bytesUp: 0,
          bytesDown: 0
        }));
      }, 2000);

    } else if (status === ConnectionStatus.CONNECTED) {
      setStatus(ConnectionStatus.DISCONNECTING);
      
      // Simulate disconnect delay
      setTimeout(() => {
        setStatus(ConnectionStatus.DISCONNECTED);
        setVpnState(prev => ({
          ...prev,
          isConnected: false,
          connectedServerId: null,
          startTime: null
        }));
      }, 1000);
    }
  };

  const currentServer = SERVERS.find(s => s.id === (status === ConnectionStatus.CONNECTED ? vpnState.connectedServerId : selectedServerId));
  const connectedServer = SERVERS.find(s => s.id === vpnState.connectedServerId);

  return (
    <div className="relative w-full h-screen bg-cyber-dark overflow-hidden flex">
      
      {/* Left Sidebar */}
      <ServerList 
        selectedServerId={selectedServerId} 
        onSelect={handleSelectServer} 
      />

      {/* Main Content Area (3D Scene) */}
      <div className="flex-1 relative">
        
        {/* 3D Background */}
        <Globe3D 
          selectedServerId={selectedServerId} 
          connectedServerId={vpnState.connectedServerId}
          onSelectServer={handleSelectServer}
        />

        {/* Overlay UI: Top Right Status */}
        <div className="absolute top-6 right-6 w-80 z-10">
          <StatusPanel 
            status={status} 
            vpnState={vpnState}
            currentServer={currentServer}
          />
        </div>

        {/* Overlay UI: Bottom Right Threat Panel (Visible only when connected) */}
        {status === ConnectionStatus.CONNECTED && connectedServer && (
          <div className="absolute bottom-6 right-6 z-10 animate-in slide-in-from-right-10 fade-in duration-500">
            <ThreatPanel connectedServer={connectedServer} />
          </div>
        )}

        {/* Overlay UI: Bottom Center Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-6 w-full max-w-2xl px-4">
          
          {/* Smart Router (Gemini) - Hide when connected to reduce clutter, or keep? Let's keep it. */}
          <div className={`transition-all duration-500 ${status === ConnectionStatus.CONNECTED ? 'opacity-50 scale-95 blur-[1px]' : 'opacity-100'}`}>
            <SmartRouter onRecommendation={handleSelectServer} />
          </div>

          {/* Big Power Button */}
          <button 
            onClick={toggleConnection}
            disabled={status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING}
            className={`
              group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500
              ${status === ConnectionStatus.CONNECTED 
                ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                : 'bg-cyber-primary/20 hover:bg-cyber-primary/30 border-2 border-cyber-primary shadow-[0_0_30px_rgba(0,243,255,0.4)]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {/* Rotating Ring when processing */}
            {(status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING) && (
               <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin"></div>
            )}
            
            <Power 
              size={40} 
              className={`transition-all duration-300 ${status === ConnectionStatus.CONNECTED ? 'text-red-500' : 'text-cyber-primary'}`} 
            />
            
            {/* Label */}
            <span className="absolute -bottom-8 text-sm font-display font-bold tracking-widest text-gray-300 uppercase">
              {status === ConnectionStatus.CONNECTING ? 'INITIATING...' : 
               status === ConnectionStatus.DISCONNECTING ? 'TERMINATING...' :
               status === ConnectionStatus.CONNECTED ? 'DISCONNECT' : 'CONNECT'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Vignette Overlay for cinematic look */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,0.6)_100%)]" />
    </div>
  );
}
