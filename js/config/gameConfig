// src/config/gameConfig.js

const GAME_WIDTH = 1080;
const GAME_HEIGHT = 1920; // Mobile portrait ratio (9:16)
const TILE_SIZE = 120; // For a 9x16 grid, this makes 9*120=1080, 16*120=1920

const GAME_CONFIG = {
    GAME_WIDTH: GAME_WIDTH,
    GAME_HEIGHT: GAME_HEIGHT,
    TILE_SIZE: TILE_SIZE,
    GRID_COLS: GAME_WIDTH / TILE_SIZE,
    GRID_ROWS: GAME_HEIGHT / TILE_SIZE,
    BASE_GOLD_REWARD: 10,
    STARTING_GOLD: 200,
    STARTING_LIVES: 20,

    RACES: {
        HUMAN: {
            id: 'human',
            name: 'Humans',
            towerType: 'MageTower',
            description: 'High range, slow attack with arcane damage.',
            color: 0x00AADD, // Blue
            stats: {
                attack: 30,
                range: 300,
                fireRate: 1500, // ms
                cost: 100
            }
        },
        ORC: {
            id: 'orc',
            name: 'Orcs',
            towerType: 'ShamanTotem',
            description: 'High damage, splash area-of-effect with nature damage.',
            color: 0xAA0000, // Red
            stats: {
                attack: 50,
                range: 200,
                fireRate: 2000,
                cost: 120,
                splashRadius: 70
            }
        },
        UNDEAD: {
            id: 'undead',
            name: 'Undead',
            towerType: 'NecromancerSpire',
            description: 'Fast attack, applies poison damage over time.',
            color: 0x5500AA, // Purple
            stats: {
                attack: 15,
                range: 250,
                fireRate: 700,
                cost: 110,
                poisonDuration: 3000, // ms
                poisonTickDamage: 5
            }
        }
    },

    ENEMIES: {
        MURLOC_SCOUT: {
            id: 'murloc_scout',
            name: 'Murloc Scout',
            health: 100,
            speed: 80, // pixels per second
            goldReward: 5,
            spriteKey: 'murloc_scout_sprite',
            color: 0x00EE00 // Green
        },
        GHOUL_RUSHER: {
            id: 'ghoul_rusher',
            name: 'Ghoul Rusher',
            health: 180,
            speed: 120,
            goldReward: 8,
            spriteKey: 'ghoul_rusher_sprite',
            color: 0x888888 // Grey
        },
        ABOMINATION_TANK: {
            id: 'abomination_tank',
            name: 'Abomination Tank',
            health: 800,
            speed: 40,
            goldReward: 25,
            spriteKey: 'abomination_tank_sprite',
            color: 0x442200 // Brown
        }
    },

    WAVES: [
        {
            waveNumber: 1,
            enemies: [
                { type: 'murloc_scout', count: 5, delay: 1000 },
                { type: 'ghoul_rusher', count: 2, delay: 1500 }
            ],
            waveRewardMultiplier: 1
        },
        {
            waveNumber: 2,
            enemies: [
                { type: 'murloc_scout', count: 8, delay: 800 },
                { type: 'ghoul_rusher', count: 4, delay: 1200 }
            ],
            waveRewardMultiplier: 1.2
        },
        {
            waveNumber: 3,
            enemies: [
                { type: 'ghoul_rusher', count: 6, delay: 1000 },
                { type: 'murloc_scout', count: 5, delay: 500 },
                { type: 'abomination_tank', count: 1, delay: 5000 }
            ],
            waveRewardMultiplier: 1.5
        },
        {
            waveNumber: 4,
            enemies: [
                { type: 'murloc_scout', count: 12, delay: 600 },
                { type: 'ghoul_rusher', count: 8, delay: 800 }
            ],
            waveRewardMultiplier: 1.8
        },
        {
            waveNumber: 5,
            enemies: [
                { type: 'abomination_tank', count: 2, delay: 4000 },
                { type: 'ghoul_rusher', count: 10, delay: 700 }
            ],
            waveRewardMultiplier: 2.0
        }
    ],

    HERO_STATS: {
        initialHealth: 500,
        initialAttack: 20,
        initialRange: 150,
        initialSpeed: 100, // pixels per second
        xpToLevel: [100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000]
    }
};
