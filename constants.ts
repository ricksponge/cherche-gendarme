
import { LevelConfig } from './types';

export const TARGET_EMOJIS = [
  { type: 'gendarme_m', emoji: '👮' },
  { type: 'gendarme_f', emoji: '👮‍♀️' },
  { type: 'car', emoji: '🚓' },
  { type: 'siren', emoji: '🚨' },
  { type: 'handcuffs', emoji: '⛓️' },
  { type: 'radio', emoji: '📻' },
  { type: 'flashlight', emoji: '🔦' },
  { type: 'dog', emoji: '🐕' },
  { type: 'shield', emoji: '🛡️' },
  { type: 'magnifier', emoji: '🔍' },
  { type: 'document', emoji: '📜' },
  { type: 'camera', emoji: '📸' },
];

export const CLUTTER_EMOJIS = [
  '🌳', '🌲', '🏢', '🏠', '🏘️', '🚗', '🚕', '🚲', '🛴', '🚶', '🏃', '🐶', '🐱', '🐦', '🍎', '🍔', '🍦', '📦', '🎈', '🎸', '⚽', '🎒', '👓', '🌂', '👟', '🧢', '👕', '👖', '👗', '💼'
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Patrouille de Quartier",
    targetCount: 5,
    clutterCount: 80,
    timeLimit: 60,
  },
  {
    id: 2,
    name: "Enquête Urbaine",
    targetCount: 8,
    clutterCount: 150,
    timeLimit: 90,
  },
  {
    id: 3,
    name: "Opération Spéciale",
    targetCount: 12,
    clutterCount: 250,
    timeLimit: 120,
  }
];

export const COLORS = {
  gendarmeBlue: '#002395',
  frenchRed: '#ED2939',
  gold: '#D4AF37',
};
