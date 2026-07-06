// src/data/GameStore.js

class GameStore {
    constructor() {
        this.state = this.loadState();
        console.log('GameStore initialized. Current state:', this.state);
    }

    _defaultState() {
        return {
            gold: GAME_CONFIG.STARTING_GOLD,
            score: 0,
            isAdFree: false,
            hasDoubleGoldPass: false,
            permanentUpgrades: { // Stores level of purchased upgrades
                'starting_gold_bonus': 0,
                'hero_starting_hp': 0,
                'all_towers_atk_bonus': 0,
                'wave_gold_bonus': 0
            }
        };
    }

    saveState() {
        try {
            localStorage.setItem('td_wow_game_state', JSON.stringify(this.state));
            console.log('Game state saved:', this.state);
        } catch (e) {
            console.error('Error saving game state to localStorage:', e);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('td_wow_game_state');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                const mergedState = { ...this._defaultState(), ...parsedState };
                if (typeof mergedState.permanentUpgrades !== 'object' || mergedState.permanentUpgrades === null) {
                    mergedState.permanentUpgrades = {};
                }
                return mergedState;
            }
        } catch (e) {
            console.error('Error loading game state from localStorage:', e);
        }
        console.log('No saved state found or error, initializing default state.');
        return this._defaultState();
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.saveState();
    }

    addGold(amount) {
        this.state.gold += amount;
        this.saveState();
    }

    spendGold(amount) {
        if (this.state.gold >= amount) {
            this.state.gold -= amount;
            this.saveState();
            return true;
        }
        return false;
    }

    hasPremiumFlag(flagName) {
        return this.state[flagName] || false;
    }

    getUpgradeLevel(upgradeId) {
        return this.state.permanentUpgrades[upgradeId] || 0;
    }

    getUpgradeEffectValue(upgradeId) {
        const level = this.getUpgradeLevel(upgradeId);
        const upgradeConfig = SHOP_CONFIG.PERMANENT_UPGRADES[upgradeId];
        if (upgradeConfig && upgradeConfig.effect) {
            return upgradeConfig.effect(level);
        }
        return 0;
    }

    applyUpgrade(upgradeId) {
        if (this.state.permanentUpgrades.hasOwnProperty(upgradeId)) {
            const upgradeConfig = SHOP_CONFIG.PERMANENT_UPGRADES[upgradeId];
            if (!upgradeConfig) {
                console.warn('Attempted to apply unknown upgrade:', upgradeId);
                return false;
            }

            const currentLevel = this.getUpgradeLevel(upgradeId);
            if (currentLevel >= upgradeConfig.maxLevel) {
                console.log(`Upgrade '${upgradeId}' is already at max level (${upgradeConfig.maxLevel}).`);
                return false;
            }

            const cost = upgradeConfig.baseCost * Math.pow(upgradeConfig.costMultiplier, currentLevel);

            if (this.spendGold(Math.round(cost))) {
                this.state.permanentUpgrades[upgradeId]++;
                this.saveState();
                console.log(`Upgrade '${upgradeId}' to level ${this.state.permanentUpgrades[upgradeId]} purchased.`);
                return true;
            } else {
                console.log('Not enough gold for upgrade:', upgradeId);
                return false;
            }
        }
        console.warn('Attempted to apply non-existent permanent upgrade:', upgradeId);
        return false;
    }

    calculateGoldReward(baseReward) {
        let finalReward = baseReward;
        if (this.hasPremiumFlag('hasDoubleGoldPass')) {
            finalReward *= 2;
            console.log('Double Gold Pass active! Reward doubled.');
        }
        const waveGoldBonusLevel = this.getUpgradeLevel('wave_gold_bonus');
        if (waveGoldBonusLevel > 0) {
            const bonusPercentage = SHOP_CONFIG.PERMANENT_UPGRADES['wave_gold_bonus'].effect(waveGoldBonusLevel);
            finalReward *= (1 + bonusPercentage);
            console.log(`Wave Gold Bonus active! (+ ${(bonusPercentage*100).toFixed(0)}%) `);
        }

        return Math.round(finalReward);
    }

    resetSessionState() {
        const defaultState = this._defaultState();
        this.state.gold = defaultState.gold;
        this.state.score = defaultState.score;
        this.saveState();
        console.log("Game session state reset. Permanent upgrades and premium flags retained.");
    }
}

const gameStore = new GameStore();
