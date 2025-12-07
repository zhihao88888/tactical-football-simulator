import React from 'react';
import { Player, Team, Ball } from '../types';
import { PlayerMarker } from './PlayerMarker';
import { BallMarker } from './BallMarker';

interface PitchProps {
  homeTeam: Team;
  awayTeam: Team;
  is3D: boolean;
  ball?: Ball;
}

export const Pitch: React.FC<PitchProps> = ({ homeTeam, awayTeam, is3D, ball }) => {
  return (
    <div className={`relative w-full max-w-5xl mx-auto aspect-[16/10] bg-[#1a7a42] border-4 border-[#145d32] rounded-lg shadow-2xl overflow-hidden select-none ${is3D ? 'pitch-perspective' : 'pitch-flat'}`}>
      
      {/* Grass Texture Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, #0f5c2e 50px, #0f5c2e 100px)'
        }}
      />
      
      {/* Field Markings */}
      <div className="absolute inset-4 border-2 border-white/60 rounded-sm pointer-events-none">
         {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60 -translate-x-1/2"></div>
        
        {/* Center Circle */}
        <div className="absolute left-1/2 top-1/2 w-32 h-32 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

        {/* Home Penalty Area (Left) */}
        <div className="absolute left-0 top-1/2 w-40 h-80 border-2 border-white/60 -translate-y-1/2 bg-transparent"></div>
        <div className="absolute left-0 top-1/2 w-16 h-32 border-2 border-white/60 -translate-y-1/2 bg-transparent"></div>
        <div className="absolute left-28 top-1/2 w-2 h-2 bg-white/80 rounded-full -translate-y-1/2"></div>
        {/* Home Arc */}
        <div className="absolute left-40 top-1/2 w-12 h-24 border-r-2 border-white/60 rounded-r-full -translate-y-1/2"></div>

        {/* Away Penalty Area (Right) */}
        <div className="absolute right-0 top-1/2 w-40 h-80 border-2 border-white/60 -translate-y-1/2 bg-transparent"></div>
        <div className="absolute right-0 top-1/2 w-16 h-32 border-2 border-white/60 -translate-y-1/2 bg-transparent"></div>
        <div className="absolute right-28 top-1/2 w-2 h-2 bg-white/80 rounded-full -translate-y-1/2"></div>
         {/* Away Arc */}
         <div className="absolute right-40 top-1/2 w-12 h-24 border-l-2 border-white/60 rounded-l-full -translate-y-1/2"></div>
        
        {/* Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-r-2 border-b-2 border-white/60 rounded-br-full -translate-x-4 -translate-y-4"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-white/60 rounded-bl-full translate-x-4 -translate-y-4"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-t-2 border-white/60 rounded-tr-full -translate-x-4 translate-y-4"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-l-2 border-t-2 border-white/60 rounded-tl-full translate-x-4 translate-y-4"></div>
      </div>

      {/* Players Layer */}
      <div className="absolute inset-0 z-10">
        {homeTeam.players.map(player => (
          <PlayerMarker key={player.id} player={player} teamColor={homeTeam.color} isHome={true} />
        ))}
        {awayTeam.players.map(player => (
          <PlayerMarker key={player.id} player={player} teamColor={awayTeam.color} isHome={false} />
        ))}
      </div>

      {/* Ball Layer */}
      {ball && <BallMarker ball={ball} is3D={is3D} />}
      
    </div>
  );
};