import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { getSmartRoutingRecommendation } from '../services/geminiService';
import { AIRecommendation } from '../types';

interface SmartRouterProps {
  onRecommendation: (serverId: string) => void;
}

export const SmartRouter: React.FC<SmartRouterProps> = ({ onRecommendation }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendation | null>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    
    try {
      const rec = await getSmartRoutingRecommendation(query);
      if (rec) {
        setResult(rec);
        onRecommendation(rec.serverId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyber-glass backdrop-blur-md border border-cyber-secondary/30 p-4 rounded-xl w-full max-w-md shadow-[0_0_20px_rgba(188,19,254,0.15)] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyber-secondary blur-[50px] opacity-20 pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-3 text-cyber-secondary">
        <Sparkles size={18} />
        <span className="font-display font-bold uppercase tracking-wider text-sm">AI Smart Routing</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="e.g., 'Low latency for Japan gaming'"
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-secondary/50 transition-all"
        />
        <button 
          onClick={handleAsk}
          disabled={loading}
          className="bg-cyber-secondary/20 hover:bg-cyber-secondary/40 text-cyber-secondary border border-cyber-secondary/50 rounded-lg p-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </div>

      {result && (
        <div className="mt-3 p-3 bg-cyber-secondary/10 rounded border border-cyber-secondary/20 animate-in fade-in slide-in-from-top-2">
          <div className="text-xs text-gray-300 mb-1">Recommendation:</div>
          <div className="text-sm text-white font-medium mb-1 flex justify-between">
            <span>Server {result.serverId.toUpperCase()}</span>
            <span className="text-cyber-secondary text-xs">{(result.confidence * 100).toFixed(0)}% Match</span>
          </div>
          <div className="text-xs text-gray-400 italic">"{result.reason}"</div>
        </div>
      )}
    </div>
  );
};
