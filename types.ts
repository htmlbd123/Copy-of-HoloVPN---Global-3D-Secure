export interface ServerNode {
  id: string;
  city: string;
  country: string;
  countryCode: string; // 2 letter ISO
  region: 'NA' | 'EU' | 'AS' | 'OC' | 'SA' | 'AF';
  lat: number;
  lng: number;
  load: number; // 0-100
  latency: number; // ms
  tags: string[]; // e.g. "streaming", "p2p", "gaming"
}

export interface VPNState {
  isConnected: boolean;
  selectedServerId: string | null;
  connectedServerId: string | null;
  startTime: number | null;
  bytesUp: number;
  bytesDown: number;
  adsBlocked: number;
  killSwitchEnabled: boolean;
}

export interface AIRecommendation {
  serverId: string;
  reason: string;
  confidence: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
}