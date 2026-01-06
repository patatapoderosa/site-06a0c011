
export enum AppStep {
  LOGIN = 0,
  DATA_ENTRY = 1,
  SERVER_LINK = 2,
  SELECTION = 3,
  TERMINAL = 4,
  SUCCESS = 5,
  ADMIN_PANEL = 6
}

export type KeyDuration = 'ONE_TIME' | '1H' | '12H' | '24H' | 'PERMANENT';

// Admin history only (local)
export interface GeneratedKeyHistory {
  code: string;
  durationLabel: string;
  durationValue: KeyDuration;
  createdAt: number;
}

// Local storage for the user (to track if THEY used a key)
export interface UserKeyUsage {
  key: string;
  firstUsedAt: number;
}

export interface HackOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'brainrot' | 'luckyblock';
}

export const HACK_OPTIONS: HackOption[] = [
  // BRAINROTS
  { id: 'meowl', name: 'SPAWN MEOWL', icon: '🦉', description: '', category: 'brainrot' },
  { id: 'raccooni', name: 'SPAWN RACCOONI JANDELINI', icon: '🦝', description: '', category: 'brainrot' },
  { id: 'strawberry_elephant', name: 'SPAWN STRAWBERRY ELEPHANT', icon: '🐘', description: '', category: 'brainrot' },
  { id: 'capitano_moby', name: 'SPAWN CAPITANO MOBY', icon: '⚓', description: '', category: 'brainrot' },
  { id: '67', name: 'SPAWN 67', icon: '6️⃣7️⃣', description: '', category: 'brainrot' },

  // LUCKY BLOCKS
  { id: 'radioactive_lb', name: 'RADIOACTIVE LUCKY BLOCK', icon: '☢️', description: '', category: 'luckyblock' },
  { id: 'los_admin_lb', name: 'LOS ADMIN LUCKY BLOCK', icon: '🕴️', description: '', category: 'luckyblock' },
  { id: 'admin_lb', name: 'ADMIN LUCKY BLOCK', icon: '🛡️', description: '', category: 'luckyblock' },
  { id: 'secret_lb', name: 'SECRET LUCKY BLOCK', icon: '🤫', description: '', category: 'luckyblock' },
];
