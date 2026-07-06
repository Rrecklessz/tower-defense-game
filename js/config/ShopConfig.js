// js/config/shopConfig.js

const SHOP_CONFIG = {
    PERMANENT_UPGRADES: {
        'starting_gold_bonus': {
            name: 'Starting Gold Bonus',
            description: 'Start each game with more gold.',
            baseCost: 100,
            costMultiplier: 1.5,
            effect: (level) => level * 50,
            maxLevel: 10
        },
        'hero_starting_hp': {
            name: 'Hero Starting HP',
            description: 'Increase your hero\'s initial health.',
            baseCost: 150,
            costMultiplier: 1.4,
            effect: (level) => level * 50,
            maxLevel: 15
        },
        'all_towers_atk_bonus': {
            name: 'All Towers Attack Bonus',
            description: 'Increase the attack damage of all your towers.',
            baseCost: 200,
            costMultiplier: 1.6,
            effect: (level) => level * 5,
            maxLevel: 20
        },
        'wave_gold_bonus': {
            name: 'Wave Gold Bonus',
            description: 'Gain more gold from completing waves.',
            baseCost: 120,
            costMultiplier: 1.3,
            effect: (level) => level * 0.05,
            maxLevel: 10
        }
    }
};
