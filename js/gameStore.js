class GameStore {
    constructor() {
        this.state = this.loadState();
        this.applyUpgrades();
    }

    // Loads state from localStorage or initializes with defaults
    loadState() {
        try {
            const serializedState = localStorage.getItem('wowtd_game_state');
            if (serializedState === null) {
                console.log("No saved state found. Initializing with defaults.");
                return { ...GAME_CONFIG.DEFAULT_GAME_STATE };
            }
            console.log("Loading game state from localStorage.");
            const loadedState = JSON.parse(serializedState);

            // Merge with defaults to ensure new config properties are added
            return {
                ...GAME_CONFIG.DEFAULT_GAME_STATE,
                ...loadedState,
                // Ensure permanentUpgrades is an object
                permanentUpgrades: typeof loadedState.permanentUpgrades === 'object' && loadedState.permanentUpgrades !== null
                    ? loadedState.permanentUpgrades
                    : {}
            };

        } catch (error) {
            console.error("Error loading game state:", error);
            // Fallback to default state if loading fails
            return { ...GAME_CONFIG.DEFAULT_GAME_STATE };
        }
    }

    // Saves current state to localStorage
    saveState() {
        try {
            const serializedState = JSON.stringify(this.state);
            localStorage.setItem('wowtd_game_state', serializedState);
            console.log("Game state saved successfully.");
        } catch (error) {
            console.error("Error saving game state:", error);
        }
    }

    // Generic getter for state properties
    get(key) {
        if (key in this.state) {
            return this.state[key];
        }
        console.warn(`Attempted to get non-existent state key: ${key}`);
        return undefined;
    }

    // Generic setter for state properties
    set(key, value) {
        if (key in this.state) {
            this.state[key] = value;
            this.saveState();
            console.log(`State key '${key}' updated to:`, value);
            return true;
        }
        console.warn(`Attempted to set non-existent state key: ${key}`);
        return false;
    }

    // Increment/decrement gold, applies 'hasDoubleGoldPass' hook
    addGold(amount) {
        let finalAmount = amount;
        if (this.state.hasDoubleGoldPass) {
            finalAmount *= 2; // Monetization hook: double gold pass
            console.log("Double Gold Pass active! Gold doubled.");
        }
        this.state.gold += finalAmount;
        this.saveState();
        console.log(`Added ${finalAmount} gold. Total: ${this.state.gold}`);
        return finalAmount;
    }

    spendGold(amount) {
        if (this.state.gold >= amount) {
            this.state.gold -= amount;
            this.saveState();
            console.log(`Spent ${amount} gold. Remaining: ${this.state.gold}`);
            return true;
        }
        console.warn(`Not enough gold to spend ${amount}. Current: ${this.state.gold}`);
        return false;
    }

    // Permanent upgrades management
    getUpgradeLevel(upgradeId) {
        return this.state.permanentUpgrades[upgradeId] || 0;
    }

    // Applies all purchased permanent upgrades to a temporary 'activeUpgrades' object
    // This should be called once at game start or after an upgrade purchase
    applyUpgrades() {
        this.activeUpgrades = {};
        this.activeUpgrades.starting_gold = 0;
        this.activeUpgrades.hero_starting_hp = 0;
        this.activeUpgrades.global_tower_atk_multiplier = 1; // Base multiplier
        this.activeUpgrades.gold_per_kill_flat_bonus = 0;

        GAME_CONFIG.PERMANENT_UPGRADES.forEach(upgradeConfig => {
            const level = this.getUpgradeLevel(upgradeConfig.id);
            if (level > 0) {
                const effects = upgradeConfig.effect(level);
                for (const key in effects) {
                    if (key in this.activeUpgrades) {
                        // Sum flat bonuses, multiply multipliers
                        if (key.includes('_multiplier')) {
                            this.activeUpgrades[key] *= effects[key];
                        } else {
                            this.activeUpgrades[key] += effects[key];
                        }
                    } else {
                        this.activeUpgrades[key] = effects[key];
                    }
                }
            }
        });
        console.log("Applied permanent upgrades:", this.activeUpgrades);
    }

    // Purchases an upgrade, updates state and applies effects
    purchaseUpgrade(upgradeId) {
        const upgradeConfig = GAME_CONFIG.PERMANENT_UPGRADES.find(u => u.id === upgradeId);
        if (!upgradeConfig) {
            console.error(`Upgrade ${upgradeId} not found.`);
            return false;
        }

        const currentLevel = this.getUpgradeLevel(upgradeId);
        if (currentLevel >= upgradeConfig.levels) {
            console.log(`${upgradeId} is already at max level.`);
            return false;
        }

        const cost = upgradeConfig.baseCost * (currentLevel + 1); // Simple linear cost increase
        if (this.spendGold(cost)) {
            this.state.permanentUpgrades[upgradeId] = currentLevel + 1;
            this.saveState();
            this.applyUpgrades(); // Reapply all upgrades after purchase
            console.log(`Purchased ${upgradeId} level ${currentLevel + 1}.`);
            return true;
        }
        return false;
    }
}

// Global instance of GameStore
const gameStore = new GameStore();