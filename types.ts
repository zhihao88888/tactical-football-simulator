export interface Player {
  id: string;
  name: string;
  number: number;
  position: { x: number; y: number }; // Percentage 0-100
  rating: number; // 0.0 - 10.0
  events: MatchEvent[];
  avatarUrl?: string;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
  secondaryColor: string;
  formation: string;
  coach: string;
  value: string;
  players: Player[];
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  height: number;
  targetId?: string | null;
  ownerId?: string | null;
}

export type EventType = 'goal' | 'yellow_card' | 'red_card' | 'sub_in' | 'sub_out';

export interface MatchEvent {
  type: EventType;
  minute: number;
  description?: string;
}

export interface Commentary {
  minute: number;
  text: string;
  type: 'neutral' | 'highlight' | 'goal';
}

export interface SimulationResponse {
  minute: number;
  commentary: string;
  events: {
    teamId: string;
    playerId: string;
    type: EventType;
  }[];
  newScore?: {
    home: number;
    away: number;
  };
}