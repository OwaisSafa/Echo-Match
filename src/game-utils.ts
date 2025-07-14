import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GameState = 'home' | 'playing' | 'paused' | 'gameOver';

export type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'pulse' | 'echo';

export interface GameStats {
  highScore: number;
  bestLevel: number;
  gamesPlayed: number;
  totalScore: number;
}

export interface Tile {
  id: number;
  waveType: WaveType;
  isFlipped: boolean;
  isMatched: boolean;
  frequency: number;
}

export interface GameData {
  level: number;
  score: number;
  combo: number;
  tiles: Tile[];
  flippedTiles: number[];
  matchedPairs: number;
  totalPairs: number;
}


export function generateRandomFrequency(): number {
  return Math.floor(Math.random() * 2000) + 200; // 200Hz to 2200Hz
}

/**
 * Calculate score based on level and combo
 */
export function calculateScore(level: number, combo: number): number {
  const baseScore = level * 10;
  const comboBonus = combo * 5;
  return baseScore + comboBonus;
}

/**
 * Generate tiles for a specific level
 */
export function generateTiles(level: number): Tile[] {
  const waveTypes: WaveType[] = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'echo'];
  const tilesPerLevel = Math.min(level + 4, 20); // Max 20 tiles
  const pairs = tilesPerLevel / 2;
  
  const tiles: Tile[] = [];
  let id = 0;
  
  for (let i = 0; i < pairs; i++) {
    const waveType = waveTypes[i % waveTypes.length];
    const frequency = generateRandomFrequency();
    
    // Create two tiles with the same wave type and frequency
    for (let j = 0; j < 2; j++) {
      tiles.push({
        id: id++,
        waveType,
        isFlipped: false,
        isMatched: false,
        frequency,
      });
    }
  }
  
  // Shuffle the tiles
  return shuffleArray(tiles);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if two tiles match
 */
export function tilesMatch(tile1: Tile, tile2: Tile): boolean {
  return tile1.waveType === tile2.waveType && tile1.frequency === tile2.frequency;
}

/**
 * Get wave type display name
 */
export function getWaveTypeName(waveType: WaveType): string {
  const names: Record<WaveType, string> = {
    sine: 'Sine',
    square: 'Square',
    triangle: 'Triangle',
    sawtooth: 'Sawtooth',
    pulse: 'Pulse',
    echo: 'Echo',
  };
  return names[waveType];
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: number): string {
  return `${frequency}Hz`;
}

/**
 * Calculate level from number of tiles
 */
export function calculateLevel(tileCount: number): number {
  return Math.max(1, tileCount - 4);
}

/**
 * Get maximum tiles for a level
 */
export function getMaxTilesForLevel(level: number): number {
  return Math.min(level + 4, 20);
} 