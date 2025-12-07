import { Team, SimulationResponse } from "../types";

// Initialize Zhipu AI configuration
const ZHIPU_API_KEY = process.env.API_KEY;
const ZHIPU_API_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

export const simulateMatchBatch = async (
  homeTeam: Team,
  awayTeam: Team,
  startMinute: number,
  duration: number
): Promise<SimulationResponse[]> => {
  const modelId = "glm-4.6";
  const endMinute = startMinute + duration - 1;

  const prompt = `
    Simulate the events of a football match between ${homeTeam.name} (ID: ${homeTeam.id}) and ${awayTeam.name} (ID: ${awayTeam.id}) for minutes ${startMinute} to ${endMinute}.
    Current Score at minute ${startMinute-1}: ${homeTeam.score} - ${awayTeam.score}.
    
    Home Players: ${homeTeam.players.map(p => `${p.name} (ID: ${p.id})`).join(', ')}.
    Away Players: ${awayTeam.players.map(p => `${p.name} (ID: ${p.id})`).join(', ')}.

    Return a JSON array with one object per minute. Each object MUST include:
    
    Required fields:
    1. 'minute': Integer (the current minute).
    2. 'commentary': String (detailed play-by-play description of what happened this minute).
    3. 'events': Array (can be empty). Events can include:
       - Type: "goal", "yellow_card", "red_card"
       - teamId: MUST be exactly "${homeTeam.id}" or "${awayTeam.id}"
       - playerId: Use the exact ID provided above
    4. 'newScore': Object (only include if a goal occurs). Format: { home: number, away: number }
       - MUST be a cumulative update from the starting score
       - For example: If starting score is 1-0 and home team scores again, newScore should be { home: 2, away: 0 }
       - For example: If starting score is 1-1 and away team scores, newScore should be { home: 1, away: 2 }
    
    Make the commentary diverse and match the events that occurred. Include specific player names and actions when possible.
    
    Output strictly valid JSON.
  `;

  try {
    const response = await fetch(ZHIPU_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZHIPU_API_KEY}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false,
        response_format: {
          type: "json_object"
        }
      })
    });

    const data = await response.json();

    if (data.code !== undefined && data.code !== 200) {
      throw new Error(`Zhipu AI API Error: ${data.msg || 'Unknown error'}`);
    }

    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content;
      let cleanText = content.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```/, "").replace(/```$/, "");
      }

      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, index: number) => ({
             minute: typeof item.minute === 'number' ? item.minute : startMinute + index, 
             commentary: item.commentary || generateDefaultCommentary(item.events || [], index),
             events: item.events || [],
             newScore: item.newScore || null
        })) as SimulationResponse[];
      }
    }
    throw new Error("Invalid response format");
  } catch (error: any) {
    console.error("Zhipu AI Simulation Failed:", error);
    
    // Throw error to let App.tsx handle backoff logic if it's a 429
    if (error.message?.includes("429") || error.status === 429) {
        throw error;
    }

    // For other errors, return fallback to keep game alive
    const fallback: SimulationResponse[] = [];
    for (let i = 0; i < duration; i++) {
        fallback.push({
            minute: startMinute + i,
            commentary: generateDefaultCommentary([], i),
            events: [],
            newScore: null
        });
    }
    return fallback;
  }
};

// Helper function to generate diverse default commentary
function generateDefaultCommentary(events: any[], index: number): string {
    const defaultCommentaries = [
        "The ball is in play, teams competing for possession.",
        "Midfield battle continues with both teams pressing.",
        "A long pass is played forward, looking for attacking opportunities.",
        "Defenders are organizing well, limiting space for the opposition.",
        "Quick one-touch passing creates a promising attack.",
        "The goalkeeper collects a high ball comfortably.",
        "A tackle wins possession back for the team.",
        "Players are moving into position for the next phase of play.",
        "A cross into the box is cleared by the defense.",
        "Build-up play from the back, maintaining possession.",
        "A through ball splits the defense, but the offside flag is up.",
        "A corner kick is awarded, teams preparing in the box.",
        "A shot from distance goes wide of the target.",
        "A free kick is taken, curling towards the goal.",
        "The referee signals for a foul, giving away a free kick."
    ];
    
    // If there are events, generate commentary based on them
    if (events.length > 0) {
        const event = events[0];
        switch (event.type) {
            case "goal":
                return `GOAL! ${event.playerId} scores an incredible goal!`;
            case "yellow_card":
                return `Yellow card shown to ${event.playerId} for a reckless tackle.`;
            case "red_card":
                return `Red card! ${event.playerId} is sent off, team down to 10 men.`;
            default:
                return defaultCommentaries[index % defaultCommentaries.length];
        }
    }
    
    // Return a random default commentary if no events
    return defaultCommentaries[index % defaultCommentaries.length];
}