import React from 'react';
import { Team } from '../types';
import { Play, Pause, AlertCircle, FastForward, Gauge } from 'lucide-react';

interface MatchInfoProps {
  homeTeam: Team;
  awayTeam: Team;
  matchTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  is3D: boolean;
  onToggle3D: () => void;
  hasApiKey: boolean;
  gameSpeed: number;
  setGameSpeed: (speed: number) => void;
}

export const MatchInfo: React.FC<MatchInfoProps> = ({ 
  homeTeam, 
  awayTeam, 
  matchTime, 
  isPlaying, 
  onTogglePlay,
  is3D,
  onToggle3D,
  hasApiKey,
  gameSpeed,
  setGameSpeed
}) => {
  // Helper to calculate total cards for a team
  const getTeamCards = (team: Team) => {
    let yellow = 0;
    let red = 0;
    team.players.forEach(p => {
      p.events.forEach(e => {
        if (e.type === 'yellow_card') yellow++;
        if (e.type === 'red_card') red++;
      });
    });
    return { yellow, red };
  };

  const homeCards = getTeamCards(homeTeam);
  const awayCards = getTeamCards(awayTeam);

  const availableSpeeds = [1.0, 1.5, 2.0, 3.0, 4.0, 5.0];

  const handleSpeedClick = () => {
    const currentIndex = availableSpeeds.indexOf(gameSpeed);
    const nextIndex = (currentIndex + 1) % availableSpeeds.length;
    setGameSpeed(availableSpeeds[nextIndex]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-6 bg-gradient-to-b from-[#1c9254] to-[#147040] rounded-xl text-white shadow-xl overflow-hidden border border-green-600/50">
      
      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-black/10 text-xs text-white/80 border-b border-white/10">
        <div className="flex space-x-4">
           <span>Coach: {homeTeam.coach}</span>
           <span>Value: {homeTeam.value}</span>
        </div>
         <div className="flex space-x-4">
           <span>Value: {awayTeam.value}</span>
           <span>Coach: {awayTeam.coach}</span>
        </div>
      </div>

      {/* Main Scoreboard */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6">
        
        {/* Home Team */}
        <div className="flex items-center space-x-4 flex-1">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/20"
                style={{ backgroundColor: homeTeam.color, color: homeTeam.secondaryColor }}
              >
                 {homeTeam.abbreviation}
              </div>
           </div>
           <div className="text-left">
             <h2 className="text-2xl font-bold leading-none">{homeTeam.name}</h2>
             <p className="text-green-200 text-sm mt-1 opacity-80">Formation: {homeTeam.formation}</p>
             <div className="flex space-x-3 mt-1.5 text-xs font-mono text-white/90">
                <div className="flex items-center space-x-1 bg-black/20 px-1.5 py-0.5 rounded">
                    <div className="w-2 h-3 bg-yellow-400 rounded-[1px] shadow-sm"></div>
                    <span>{homeCards.yellow}</span>
                </div>
                <div className="flex items-center space-x-1 bg-black/20 px-1.5 py-0.5 rounded">
                    <div className="w-2 h-3 bg-red-600 rounded-[1px] shadow-sm"></div>
                    <span>{homeCards.red}</span>
                </div>
             </div>
           </div>
        </div>

        {/* Score & Time */}
        <div className="flex flex-col items-center mx-8 min-w-[140px]">
           <div className="text-5xl font-black tracking-tighter drop-shadow-lg flex items-center space-x-2">
             <span>{homeTeam.score}</span>
             <span className="text-2xl text-white/50">-</span>
             <span>{awayTeam.score}</span>
           </div>
           <div className="mt-2 px-3 py-1 bg-black/20 rounded-full text-sm font-mono tracking-widest border border-white/10">
             {matchTime}'
           </div>
           
           <div className="flex space-x-2 mt-4">
               {!hasApiKey ? (
                  <button disabled className="bg-gray-500 text-white p-2 rounded-full cursor-not-allowed opacity-50">
                     <AlertCircle size={20} />
                  </button>
               ) : (
                <button 
                    onClick={onTogglePlay}
                    className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white text-green-700 hover:bg-gray-100'}`}
                    title={isPlaying ? "Pause Match" : "Start Match"}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
               )}

               <button
                  onClick={handleSpeedClick}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-colors bg-white/10 border border-white/30 text-white hover:bg-white/20 min-w-[70px] justify-center"
                  title="Change Game Speed"
               >
                   <FastForward size={14} />
                   <span>{gameSpeed.toFixed(1)}x</span>
               </button>
               
               <button 
                  onClick={onToggle3D}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${is3D ? 'bg-blue-600 border-blue-400 text-white' : 'bg-transparent border-white/30 text-white hover:bg-white/10'}`}
               >
                 {is3D ? '3D' : '2D'}
               </button>
           </div>
        </div>

        {/* Away Team */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
           <div className="text-right flex flex-col items-end">
             <h2 className="text-2xl font-bold leading-none">{awayTeam.name}</h2>
             <p className="text-green-200 text-sm mt-1 opacity-80">Formation: {awayTeam.formation}</p>
             <div className="flex space-x-3 mt-1.5 text-xs font-mono text-white/90 justify-end">
                <div className="flex items-center space-x-1 bg-black/20 px-1.5 py-0.5 rounded">
                    <div className="w-2 h-3 bg-yellow-400 rounded-[1px] shadow-sm"></div>
                    <span>{awayCards.yellow}</span>
                </div>
                <div className="flex items-center space-x-1 bg-black/20 px-1.5 py-0.5 rounded">
                    <div className="w-2 h-3 bg-red-600 rounded-[1px] shadow-sm"></div>
                    <span>{awayCards.red}</span>
                </div>
             </div>
           </div>
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/20"
                style={{ backgroundColor: awayTeam.color, color: awayTeam.secondaryColor }}
              >
                 {awayTeam.abbreviation}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};