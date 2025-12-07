import { Team, Player } from './types';

// Helper to create players quickly
const createPlayer = (
  id: string,
  name: string,
  number: number,
  x: number,
  y: number,
  rating: number,
  role: Player['role']
): Player => ({
  id,
  name,
  number,
  position: { x, y },
  rating,
  events: [],
  role,
});

export const HOME_TEAM_ID = 'rb_leipzig';
export const AWAY_TEAM_ID = 'frankfurt';

export const INITIAL_HOME_TEAM: Team = {
  id: HOME_TEAM_ID,
  name: 'RB Leipzig',
  abbreviation: 'RBL',
  color: '#FFFFFF', // White primary
  secondaryColor: '#DD0033', // Red secondary
  formation: '4-2-2-2',
  coach: 'Marco Rose',
  value: '€515.00M',
  score: 0,
  players: [
    createPlayer('h1', 'Gulácsi', 1, 8, 50, 7.2, 'GK'),        // GK
    createPlayer('h2', 'Henrichs', 39, 25, 15, 6.9, 'DEF'),    // RB
    createPlayer('h3', 'Orbán', 4, 22, 38, 7.3, 'DEF'),        // CB
    createPlayer('h4', 'Lukeba', 23, 22, 62, 7.5, 'DEF'),      // CB
    createPlayer('h5', 'Raum', 22, 25, 85, 7.1, 'DEF'),        // LB
    createPlayer('h6', 'Haidara', 8, 38, 35, 7.0, 'MID'),      // CDM
    createPlayer('h7', 'Seiwald', 13, 38, 65, 6.8, 'MID'),     // CDM
    createPlayer('h8', 'Baumgartner', 14, 55, 20, 7.0, 'MID'), // RAM
    createPlayer('h9', 'Xavi', 20, 55, 80, 8.1, 'MID'),        // LAM
    createPlayer('h10', 'Openda', 17, 70, 40, 7.8, 'FWD'),     // ST
    createPlayer('h11', 'Šeško', 30, 70, 60, 7.6, 'FWD'),      // ST
  ],
};

export const INITIAL_AWAY_TEAM: Team = {
  id: AWAY_TEAM_ID,
  name: 'Eintracht Frankfurt',
  abbreviation: 'EFF',
  color: '#000000', // Black primary
  secondaryColor: '#E1000F', // Red secondary
  formation: '3-4-2-1',
  coach: 'Dino Toppmöller',
  value: '€285.00M',
  score: 0,
  players: [
    createPlayer('a1', 'Trapp', 1, 92, 50, 7.4, 'GK'),         // GK
    createPlayer('a2', 'Tuta', 35, 82, 25, 6.9, 'DEF'),        // RCB
    createPlayer('a3', 'Koch', 4, 82, 50, 7.2, 'DEF'),         // CB
    createPlayer('a4', 'Theate', 3, 82, 75, 7.0, 'DEF'),       // LCB
    createPlayer('a5', 'Kristensen', 13, 65, 10, 6.8, 'MID'),  // RWB
    createPlayer('a6', 'Skhiri', 15, 65, 40, 7.1, 'MID'),      // CM
    createPlayer('a7', 'Larsson', 16, 65, 60, 7.3, 'MID'),     // CM
    createPlayer('a8', 'Nkounkou', 29, 65, 90, 6.7, 'MID'),    // LWB
    createPlayer('a9', 'Marmoush', 7, 50, 30, 8.2, 'FWD'),     // RF
    createPlayer('a10', 'Götze', 27, 50, 70, 7.0, 'FWD'),      // LF
    createPlayer('a11', 'Ekitiké', 11, 45, 50, 7.5, 'FWD'),    // ST
  ],
};