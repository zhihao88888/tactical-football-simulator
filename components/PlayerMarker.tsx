import React from 'react';
import { Player } from '../types';

interface PlayerMarkerProps {
  player: Player;
  teamColor: string;
  isHome: boolean;
}

export const PlayerMarker: React.FC<PlayerMarkerProps> = ({ player, teamColor, isHome }) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 7.0) return 'bg-green-500';
    if (rating >= 6.0) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const hasGoal = player.events.some(e => e.type === 'goal');
  const hasYellow = player.events.some(e => e.type === 'yellow_card');
  const hasRed = player.events.some(e => e.type === 'red_card');

  return (
    <div
      className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out cursor-pointer hover:scale-110 z-10"
      style={{
        left: `${player.position.x}%`,
        top: `${player.position.y}%`,
      }}
    >
      {/* Rating Badge */}
      <div className={`absolute -top-3 -right-3 ${getRatingColor(player.rating)} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-20`}>
        {player.rating.toFixed(2)}
      </div>

      {/* Events Indicators */}
      <div className="absolute -top-4 -left-4 flex space-x-0.5">
        {hasGoal && <span className="text-sm">⚽</span>}
        {hasYellow && <div className="w-2.5 h-3.5 bg-yellow-400 border border-white rounded-sm shadow-sm" />}
        {hasRed && <div className="w-2.5 h-3.5 bg-red-600 border border-white rounded-sm shadow-sm" />}
      </div>

      {/* Player Circle */}
      <div 
        className={`w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg relative bg-gray-800 flex items-center justify-center`}
      >
        {player.avatarUrl ? (
             <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
        ) : (
            <div 
                className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: teamColor }}
            >
                {player.number}
            </div>
        )}
      </div>

      {/* Player Name */}
      <div className="mt-1 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shadow-md max-w-[100px] truncate">
        {player.name}
      </div>
    </div>
  );
};