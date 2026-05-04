import { GoogleGenAI, Type } from "@google/genai";
import { Piece, Player, Position, AIDifficulty, GameMode } from "../types";
import { getAllValidMoves, evaluateBoard, isValidMove } from "../gameLogic";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getAIMove(
  board: (Piece | null)[][], 
  currentPlayer: Player, 
  mode: GameMode,
  difficulty: AIDifficulty
): Promise<{ from: Position; to: Position } | null> {
  const allMoves = getAllValidMoves(board, currentPlayer, mode);
  if (allMoves.length === 0) return null;

  if (difficulty === AIDifficulty.EASY) {
    // Random move
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  if (difficulty === AIDifficulty.MEDIUM) {
    // Greedy move based on evaluation
    let bestMove = allMoves[0];
    let maxScore = -Infinity;

    for (const move of allMoves) {
      const tempBoard = board.map(r => [...r]);
      tempBoard[move.to.row][move.to.col] = tempBoard[move.from.row][move.from.col];
      tempBoard[move.from.row][move.from.col] = null;
      
      const score = evaluateBoard(tempBoard, currentPlayer, mode);
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // HARD Difficulty: Use Gemini
  const prompt = `
    You are a grandmaster level player at '${mode === GameMode.JUNGLE ? 'Jungle Chess' : 'Zodiac Chess'}'.
    Current Board State:
    ${JSON.stringify(board)}
    
    It is ${currentPlayer}'s turn.
    Aim: Reach the opponent's Den or capture all their pieces.
    
    Difficulty Level: ${difficulty}
    Strategy: Think several moves ahead. Protect your high-value pieces. Control the center. Pressure the opponent's Den.
    
    Return the best move in JSON format: { "from": { "row": number, "col": number }, "to": { "row": number, "col": number } }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          from: {
            type: Type.OBJECT,
            properties: {
              row: { type: Type.INTEGER },
              col: { type: Type.INTEGER },
            },
            required: ["row", "col"]
          },
          to: {
            type: Type.OBJECT,
            properties: {
              row: { type: Type.INTEGER },
              col: { type: Type.INTEGER },
            },
            required: ["row", "col"]
          },
        },
        required: ["from", "to"]
      },
    },
  });

  try {
    const move = JSON.parse(response.text || "null");
    if (move && isValidMove(move.from, move.to, board[move.from.row]?.[move.from.col]!, board, mode)) {
      return move;
    }
    // Fallback to medium logic if AI returns invalid move
    return getAIMove(board, currentPlayer, mode, AIDifficulty.MEDIUM);
  } catch (e) {
    console.error("Failed to parse AI move:", e);
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }
}
