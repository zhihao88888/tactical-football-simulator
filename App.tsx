import React, { useState, useEffect, useRef } from 'react';
import { Pitch } from './components/Pitch';
import { MatchInfo } from './components/MatchInfo';
import { INITIAL_HOME_TEAM, INITIAL_AWAY_TEAM } from './constants';
import { Team, Commentary, Player, Ball, SimulationResponse } from './types';
import { simulateMatchBatch } from './services/geminiService';
import { MessageSquare, AlertTriangle } from 'lucide-react';

export default function App() {
  const [homeTeam, setHomeTeam] = useState<Team>(INITIAL_HOME_TEAM);
  const [awayTeam, setAwayTeam] = useState<Team>(INITIAL_AWAY_TEAM);
  const [matchTime, setMatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [commentaryFeed, setCommentaryFeed] = useState<Commentary[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);

  // Buffer State
  const [simBuffer, setSimBuffer] = useState<SimulationResponse[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedUpTo, setFetchedUpTo] = useState(0);
  const [errorBackoffUntil, setErrorBackoffUntil] = useState(0);
  
  // Current Frame Processing
  const [currentFrame, setCurrentFrame] = useState<SimulationResponse | null>(null);

  // Animation State
  const [ball, setBall] = useState<Ball>({ x: 50, y: 50, height: 0, targetId: null, ownerId: null });
  const [possessionTeamId, setPossessionTeamId] = useState<string>(INITIAL_HOME_TEAM.id);

  const commentaryEndRef = useRef<HTMLDivElement>(null);
  
  // Ref for base positions to calculate drift
  const baseHomePositions = useRef(INITIAL_HOME_TEAM.players.map(p => ({ id: p.id, ...p.position })));
  const baseAwayPositions = useRef(INITIAL_AWAY_TEAM.players.map(p => ({ id: p.id, ...p.position })));

  useEffect(() => {
    if (process.env.API_KEY) {
      setHasApiKey(true);
    }
  }, []);

  useEffect(() => {
    if (commentaryEndRef.current) {
      commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commentaryFeed]);

  // --- Animation Loop ---
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
        const time = Date.now();

        // 1. Move Ball
        setBall(prevBall => {
            let newBall = { ...prevBall };
            if (newBall.targetId) {
                const allPlayers = [...homeTeam.players, ...awayTeam.players];
                const targetPlayer = allPlayers.find(p => p.id === newBall.targetId);
                if (targetPlayer) {
                    const dx = targetPlayer.position.x - newBall.x;
                    const dy = targetPlayer.position.y - newBall.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const speed = 1.5 * gameSpeed;
                    if (dist <= speed || dist < 1.0) {
                        newBall.x = targetPlayer.position.x;
                        newBall.y = targetPlayer.position.y;
                        newBall.ownerId = targetPlayer.id;
                        newBall.targetId = null; 
                    } else {
                        newBall.x += (dx / dist) * speed;
                        newBall.y += (dy / dist) * speed;
                        const midDist = 15; 
                        newBall.height = Math.max(0, 5 - Math.abs(dist - midDist)/2); 
                    }
                } else {
                    newBall.targetId = null;
                }
            } else if (newBall.ownerId) {
                const allPlayers = [...homeTeam.players, ...awayTeam.players];
                const owner = allPlayers.find(p => p.id === newBall.ownerId);
                if (owner) {
                    newBall.x = owner.position.x + 1;
                    newBall.y = owner.position.y + 1;
                    newBall.height = 0;
                    if (Math.random() < 0.05 * gameSpeed) {
                         const currentTeam = homeTeam.players.find(p => p.id === owner.id) ? homeTeam : awayTeam;
                         const teammates = currentTeam.players.filter(p => p.id !== owner.id);
                         const receiver = teammates[Math.floor(Math.random() * teammates.length)];
                         newBall.targetId = receiver.id;
                         newBall.ownerId = null;
                         if (Math.random() < 0.1) {
                             const otherTeam = currentTeam.id === homeTeam.id ? awayTeam : homeTeam;
                             const interceptor = otherTeam.players[Math.floor(Math.random() * otherTeam.players.length)];
                             newBall.targetId = interceptor.id;
                             setPossessionTeamId(otherTeam.id);
                         }
                    }
                }
            } else {
                newBall.targetId = homeTeam.players[0].id; 
            }
            return newBall;
        });

        // 2. Move Players (Drift)
        const updatePlayerPositions = (team: Team, basePositions: any[]) => {
            return team.players.map(p => {
                const base = basePositions.find(bp => bp.id === p.id);
                if (!base) return p;
                const offsetAmount = 2.0; 
                const speed = 0.002 * gameSpeed;
                const uniqueSeed = p.number * 100; 
                const offsetX = Math.sin(time * speed + uniqueSeed) * offsetAmount;
                const offsetY = Math.cos(time * speed + uniqueSeed) * offsetAmount;
                return { ...p, position: { x: base.x + offsetX, y: base.y + offsetY } };
            });
        };
        setHomeTeam(prev => ({ ...prev, players: updatePlayerPositions(prev, baseHomePositions.current) }));
        setAwayTeam(prev => ({ ...prev, players: updatePlayerPositions(prev, baseAwayPositions.current) }));
    }, 50); 

    return () => clearInterval(interval);
  }, [isPlaying, homeTeam.players.length, awayTeam.players.length, gameSpeed]); 

  // --- PRODUCER: Fetch Batches ---
  useEffect(() => {
    if (!isPlaying || !hasApiKey || matchTime >= 90) return;

    // Check if we are in a backoff period (due to 429 error)
    if (Date.now() < errorBackoffUntil) return;

    const BUFFER_THRESHOLD = 8;
    
    if (!isFetching && simBuffer.length < BUFFER_THRESHOLD && fetchedUpTo < 90) {
      const isFirstBatch = fetchedUpTo === 0;
      const batchSize = isFirstBatch ? 3 : 12;
      
      const nextStart = fetchedUpTo + 1;
      const duration = Math.min(batchSize, 90 - fetchedUpTo);

      if (duration > 0) {
        setIsFetching(true);
        simulateMatchBatch(homeTeam, awayTeam, nextStart, duration)
          .then(batchResults => {
            setSimBuffer(prev => [...prev, ...batchResults]);
            setFetchedUpTo(prev => prev + duration);
            setIsFetching(false);
          })
          .catch(err => {
            console.error("Batch fetch failed, backing off:", err);
            // If we hit a rate limit, pause fetching for 10 seconds but keep playing buffer
            // We insert fallback data LOCALLY to ensure the game doesn't stall if buffer is empty
            const fallback: SimulationResponse[] = [];
            for (let i = 0; i < duration; i++) {
                fallback.push({
                    minute: nextStart + i,
                    commentary: "Match intensity is high...",
                    events: [],
                    newScore: null
                });
            }
            setSimBuffer(prev => [...prev, ...fallback]);
            setFetchedUpTo(prev => prev + duration);
            setErrorBackoffUntil(Date.now() + 10000); // 10s delay
            setIsFetching(false);
          });
      }
    }
  }, [isPlaying, hasApiKey, simBuffer.length, fetchedUpTo, matchTime, isFetching, errorBackoffUntil]);


  // --- CONSUMER: Buffer Popper ---
  useEffect(() => {
    if (!isPlaying) return;

    const tickDuration = 10000 / gameSpeed;

    const intervalId = setInterval(() => {
        setSimBuffer(currentBuffer => {
            if (currentBuffer.length > 0) {
                const [nextFrame, ...remainingBuffer] = currentBuffer;
                setCurrentFrame(nextFrame);
                return remainingBuffer;
            }
            return currentBuffer;
        });
    }, tickDuration);

    return () => clearInterval(intervalId);
  }, [isPlaying, gameSpeed]);

  // --- PROCESSOR: Apply Frame Data ---
  useEffect(() => {
    if (!currentFrame) return;

    const { minute, commentary, newScore, events } = currentFrame;

    // 1. Update Time
    if (typeof minute === 'number') {
        setMatchTime(minute);
    }

    // 2. Update Commentary
    if (commentary) {
        setCommentaryFeed(prev => {
            if (prev.length > 0 && prev[prev.length - 1].minute === minute && prev[prev.length - 1].text === commentary) {
                return prev;
            }
            return [
                ...prev, 
                { 
                  minute: minute, 
                  text: commentary, 
                  type: events && events.some(e => e.type === 'goal') ? 'goal' : 'neutral'
                }
            ];
        });
    }

    // 3. Update Score
    if (newScore && typeof newScore.home === 'number' && typeof newScore.away === 'number') {
        setHomeTeam(prev => ({ ...prev, score: newScore.home }));
        setAwayTeam(prev => ({ ...prev, score: newScore.away }));
    }

    // 4. Process Events (Goals, Cards)
    if (events && events.length > 0) {
        events.forEach(event => {
            const updateTeam = (team: Team) => {
                 // Relaxed ID check: matches ID OR standard 'home'/'away' strings if AI hallucinates
                 const isTeamMatch = team.id === event.teamId || 
                                    (team.id === homeTeam.id && event.teamId?.toLowerCase() === 'home') ||
                                    (team.id === awayTeam.id && event.teamId?.toLowerCase() === 'away');
                                    
                 if (!isTeamMatch) return team;
                 
                 let idx = -1;
                 if (event.playerId) {
                    idx = team.players.findIndex(p => p.id === event.playerId);
                 }
                 
                 // Fallback: If player ID not found (or AI Hallucination), assign to random player to ensure event counts
                 if (idx === -1) {
                    idx = Math.floor(Math.random() * team.players.length);
                 }
                 
                 const newPlayers = [...team.players];
                 const p = { ...newPlayers[idx] };
                 
                 // Add event
                 p.events = [...p.events, { type: event.type, minute: minute }];
                 
                 // Rating adjustments
                 if (event.type === 'goal') p.rating = Math.min(10, p.rating + 1.5);
                 if (event.type === 'yellow_card') p.rating = Math.max(3, p.rating - 0.5);
                 if (event.type === 'red_card') p.rating = Math.max(1, p.rating - 2.0);
                 
                 newPlayers[idx] = p;
                 return { ...team, players: newPlayers };
            };

            // Try to update both teams (logic inside will filter by ID)
            setHomeTeam(prev => updateTeam(prev));
            setAwayTeam(prev => updateTeam(prev));
        });
    }

    // End Game Check
    if (minute >= 90) {
       setIsPlaying(false);
       setCommentaryFeed(prev => [...prev, { minute: 90, text: "The referee blows the final whistle! What a match.", type: 'highlight' }]);
    }

  }, [currentFrame]); // Only run when currentFrame changes

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Header Warning if no key */}
        {!hasApiKey && (
           <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-center space-x-3">
              <AlertTriangle />
              <span>Missing API Key. Please configure `process.env.API_KEY` to enable the simulation.</span>
           </div>
        )}

        <MatchInfo 
          homeTeam={homeTeam} 
          awayTeam={awayTeam} 
          matchTime={matchTime} 
          isPlaying={isPlaying} 
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          is3D={is3D}
          onToggle3D={() => setIs3D(!is3D)}
          hasApiKey={hasApiKey}
          gameSpeed={gameSpeed}
          setGameSpeed={setGameSpeed}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Pitch Area */}
          <div className="lg:col-span-3 relative">
             <Pitch 
                homeTeam={homeTeam} 
                awayTeam={awayTeam} 
                is3D={is3D}
                ball={ball}
             />
             
             {/* Legend */}
             <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span>Rating 7.0+</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-orange-400 rounded-full"></div><span>Rating 6.0-6.9</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span>Rating &lt; 6.0</span></div>
                <div className="flex items-center space-x-1"><span className="text-base">⚽</span><span>Goal</span></div>
                <div className="flex items-center space-x-1"><div className="w-2 h-3 bg-yellow-400 rounded-sm"></div><span>Yellow Card</span></div>
                <div className="flex items-center space-x-1"><div className="w-2 h-3 bg-red-600 rounded-sm"></div><span>Red Card</span></div>
             </div>
          </div>

          {/* Commentary Sidebar */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 h-[600px] flex flex-col shadow-xl">
             <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur rounded-t-xl flex items-center space-x-2">
                <MessageSquare size={18} className="text-blue-400" />
                <h3 className="font-bold text-slate-200">Live Commentary</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-600">
               {commentaryFeed.length === 0 ? (
                 <div className="text-slate-500 text-center mt-10 italic">
                   Match is about to start...
                 </div>
               ) : (
                 commentaryFeed.map((comm, idx) => (
                   <div key={idx} className={`flex space-x-3 animate-fade-in ${comm.type === 'goal' ? 'bg-green-900/30 p-2 rounded-lg border border-green-800' : ''}`}>
                      <div className="font-bold text-blue-400 shrink-0 w-8 text-right">{comm.minute}'</div>
                      <div className={`text-slate-300 ${comm.type === 'goal' ? 'font-bold text-white' : ''}`}>
                        {comm.text}
                      </div>
                   </div>
                 ))
               )}
               <div ref={commentaryEndRef} />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}