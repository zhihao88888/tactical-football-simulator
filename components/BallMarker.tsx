import React from 'react';
import { Ball } from '../types';

interface BallMarkerProps {
  ball: Ball;
  is3D: boolean;
}

export const BallMarker: React.FC<BallMarkerProps> = ({ ball, is3D }) => {
  return (
    <div
      className="absolute z-20 pointer-events-none transition-transform duration-75 ease-linear"
      style={{
        left: `${ball.x}%`,
        top: `${ball.y}%`,
        transform: `translate(-50%, -50%) ${is3D ? `translateY(-${ball.height * 2}px)` : ''}`
      }}
    >
      {/* Ball Shadow */}
      <div 
        className="absolute w-3 h-3 bg-black/40 rounded-full blur-[2px]"
        style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${1 - (ball.height / 20)})`
        }}
      />
      
      {/* Ball Body */}
      <div 
        className="relative w-3 h-3 bg-white rounded-full shadow-sm border border-gray-300"
        style={{
           background: 'radial-gradient(circle at 30% 30%, #ffffff, #d1d5db)',
        }}
      >
        {/* Simple pattern on ball */}
        <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gray-300 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-gray-300 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
      </div>
    </div>
  );
};