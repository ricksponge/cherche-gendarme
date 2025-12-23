
export interface GameObject {
  id: string;
  type: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number;
  scale: number;
  isTarget: boolean;
  found: boolean;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  WON = 'WON',
  GAMEOVER = 'GAMEOVER'
}

export interface LevelConfig {
  id: number;
  name: string;
  targetCount: number;
  clutterCount: number;
  timeLimit: number;
}
