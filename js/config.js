const GAME_CONFIG = {
    // Game dimensions for mobile portrait
    GAME_WIDTH: 1080,
    GAME_HEIGHT: 1920,
    TILE_SIZE: 120, // Example tile size for grid

    // --- Factions/Races Configuration ---
    RACES: {
        HUMAN: {
            name: "Humans",
            towerType: "Mage Tower",
            assetKey: "human_mage_tower_sprite",
            color: 0x4287f5, // Blue
            stats: {
                range: 400,
                damage: 50,
                fireRate: 1500, // ms
                projectileSpeed: 800
            },
            description: "High range, slow firing magical attacks.",
        },
        ORC: {
            name: "Orcs",
            towerType: "Shaman Totem",
            assetKey: "orc_shaman_totem_sprite",
            color: 0x228b22, // Forest Green
            stats: {
                range: 250,
                damage: 80,
                fireRate: 2000,
                projectileSpeed: 600,
                splashRadius: 80
            },
            description: "High damage, splash attacks.",
        },
        UNDEAD: {
            name: "Undead",
            towerType: "Necromancer Spire",
            assetKey: "undead_necromancer_spire_sprite",
            color: 0x800080, // Purple
            stats: {
                range: 300,
                damage: 30,
                fireRate: 800,
                projectileSpeed: 1000,
                poisonDamage: 10, // damage per second
                poisonDuration: 3000 // ms
            },
            description: "Fast attack speed, applies poison damage over time.",
        },
    },

    // --- Enemy Waves Configuration ---
    ENEMY_TYPES: {
        MURLOC_SCOUT: {
            name: "Murloc Scout",
            assetKey: "murloc_scout_sprite",
            color: 0x00ced1, // Dark Turquoise
            stats: {
                health: 100,
                speed: 80, // pixels per second
                goldValue: 5,
                bountyXP: 10
            },
            description: "Fast, low health.",
        },
        GHOUL_RUSHER: {
            name: "Ghoul Rusher",
            assetKey: "ghoul_rusher_sprite",
            color: 0x8b0000, // Dark Red
            stats: {
                health: 300,
                speed: 50,
                goldValue: 15,
                bountyXP: 25
            },
            description: "Medium speed, moderate health.",
        },
        // Add more enemy types as needed
    },

    // --- Hero Configuration ---
    HERO_CONFIG: {
        name: "Arthas",
        assetKey: "hero_arthas_sprite",
        color: 0xadd8e6, // Light Blue
        initialStats: {
            health: 500,
            damage: 75,
            attackRange: 200,
            attackSpeed: 1000, // ms
            movementSpeed: 150, // pixels per second
            level: 1,
            xpToNextLevel: 100
        },
        levelUpBonus: {
            health: 50,
            damage: 10,
            attackRange: 10,
            attackSpeedReduction: 50, // ms
        }
    },

    // --- Permanent Upgrades (for GameStore) ---
    PERMANENT_UPGRADES: [
        {
            id: "starting_gold_bonus",
            name: "Starting Gold Bonus",
            description: "Increases starting gold by 50.",
            baseCost: 100,
            effect: (value) => ({ starting_gold: value * 50 }),
            levels: 5,
        },
        {
            id: "hero_starting_hp",
            name: "Hero Initial HP",
            description: "Increases hero's starting health by 50.",
            baseCost: 150,
            effect: (value) => ({ hero_starting_hp: value * 50 }),
            levels: 10,
        },
        {
            id: "tower_atk_bonus",
            name: "Global Tower Attack Bonus",
            description: "Increases all tower attack damage by 5%.",
            baseCost: 200,
            effect: (value) => ({ global_tower_atk_multiplier: 1 + (value * 0.05) }),
            levels: 10,
        },
        {
            id: "gold_per_kill_bonus",
            name: "Gold Per Kill Bonus",
            description: "Increases gold gained per enemy kill by 1.",
            baseCost: 100,
            effect: (value) => ({ gold_per_kill_flat_bonus: value * 1 }),
            levels: 10,
        },
        // Add more permanent upgrades here
    ],

    // --- Game State Defaults ---
    DEFAULT_GAME_STATE: {
        gold: 500,
        currentWave: 0,
        lives: 20,
        score: 0,
        isAdFree: false,
        hasDoubleGoldPass: false,
        permanentUpgrades: {
            // Stores levels for each upgrade, e.g., 'starting_gold_bonus': 1
        },
        // Other game-specific states can go here
    },

    // --- Asset Keys (for easy texture drop-in) ---
    ASSET_KEYS: {
        // Towers
        HUMAN_MAGE_TOWER: 'human_mage_tower_sprite',
        ORC_SHAMAN_TOTEM: 'orc_shaman_totem_sprite',
        UNDEAD_NECROMANCER_SPIRE: 'undead_necromancer_spire_sprite',
        
        // Enemies
        MURLOC_SCOUT: 'murloc_scout_sprite',
        GHOUL_RUSHER: 'ghoul_rusher_sprite',

        // Hero
        HERO_ARTHAS: 'hero_arthas_sprite',

        // UI
        BUTTON_PRIMARY: 'button_primary',
        PANEL_BACKGROUND: 'panel_background',
        // ... more UI assets
    },
};