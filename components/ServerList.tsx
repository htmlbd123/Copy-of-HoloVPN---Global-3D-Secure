import React, { useState, useMemo } from 'react';
import { SERVERS } from '../constants';
import { ServerNode } from '../types';
import { Search, Signal, Star, Tag } from 'lucide-react';

interface ServerListProps {
  selectedServerId: string | null;
  onSelect: (id: string) => void;
}

export const ServerList: React.FC<ServerListProps> = ({ selectedServerId, onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    SERVERS.forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const filtered = SERVERS.filter(s => {
    const matchesSearch = s.city.toLowerCase().includes(search.toLowerCase()) || 
                         s.country.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || (s.tags && s.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col h-full bg-cyber-glass/80 backdrop-blur-xl border-r border-white/10 w-80 z-10 shadow-2xl">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary">
          HoloVPN
        </h1>
        <div className="text-xs text-gray-400 mt-1 tracking-widest">GLOBAL SECURE MESH</div>
      </div>

      {/* Tags Filter */}
      <div className="px-4 py-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500 uppercase tracking-widest">
          <Tag size={10} />
          <span>Filter by Tag</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border
              ${!selectedTag 
                ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'}
            `}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border
                ${selectedTag === tag 
                  ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'}
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search locations..." 
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyber-primary/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filtered.length > 0 ? (
          filtered.map(server => {
            const isSelected = selectedServerId === server.id;
            return (
              <button
                key={server.id}
                onClick={() => onSelect(server.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                  ${isSelected ? 'bg-white/10 border border-cyber-primary/30' : 'hover:bg-white/5 border border-transparent'}
                `}
              >
                {/* Selection Indicator */}
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-primary shadow-[0_0_10px_#00f3ff]" />}

                <div className="flex items-center gap-3 w-full">
                  <img 
                    src={`https://flagcdn.com/w40/${server.countryCode.toLowerCase()}.png`} 
                    alt={server.countryCode}
                    className="w-6 h-4 rounded shadow-sm"
                  />
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${isSelected ? 'text-cyber-primary' : 'text-gray-200'}`}>
                      {server.city}
                    </div>
                    <div className="text-xs text-gray-500">{server.country}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        <Signal size={12} className={server.load < 50 ? 'text-green-400' : 'text-yellow-400'} />
                        <span className="text-xs text-gray-400">{server.latency}ms</span>
                    </div>
                    <span className="text-[10px] bg-white/5 px-1 rounded text-gray-500 border border-white/5">
                      {server.load}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm italic">
            No servers found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
