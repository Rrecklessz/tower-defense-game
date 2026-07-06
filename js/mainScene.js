class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.grid = [];
        this.path = null;
        this.enemies = null; // Phaser Group for enemies
        this.towers = null; // Phaser Group for towers
        this.hero = null;
        this.ui = null;
        this.waveNumber = 0;
        this.lives = GAME_CONFIG.DEFAULT_GAME_STATE.lives;
        this.isGameOver = false;
    }

    preload() {
        // --- Placeholder Graphics Loading ---
        // For Towers: generate textures from graphics
        for (const raceKey in GAME_CONFIG.RACES) {
            const config = GAME_CONFIG.RACES[raceKey];
            const radius = GAME_CONFIG.TILE_SIZE / 3;
            const graphics = this.add.graphics();
            graphics.fillStyle(config.color, 1);
            graphics.fillCircle(0, 0, radius);
            graphics.generateTexture(config.assetKey, radius * 2, radius * 2);
            graphics.destroy();
        }

        // For Enemies: textures generated in Enemy class constructor
        // For Hero: texture generated in Hero class constructor (using triangle in current example)

        // Placeholder for a simple particle, can be replaced by a star sprite, etc.
        const starGraphics = this.add.graphics({ fillStyle: { color: 0xffd700 } });
        starGraphics.fillPoint(0, 0, 10);
        starGraphics.generateTexture('star', 10, 10);
        starGraphics.destroy();
    }

    create() {
        console.log("MainScene created.");

        // Set up mobile-responsive scaling
        this.scale.stopListeners(); // Stop Phaser from managing scale by default
        this.scale.resize(GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT);
        this.scale.setZoom(1);
        this.scale.setGameSize(GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT);
        this.scale.refresh();

        // Calculate aspect ratios
        const gameRatio = GAME_CONFIG.GAME_WIDTH / GAME_CONFIG.GAME_HEIGHT;
        const windowRatio = window.innerWidth / window.innerHeight;

        let width = GAME_CONFIG.GAME_WIDTH;
        let height = GAME_CONFIG.GAME_HEIGHT;

        if (windowRatio < gameRatio) {
            // Window is narrower than game, scale by width
            width = window.innerWidth;
            height = width / gameRatio;
        } else {
            // Window is wider than game, scale by height
            height = window.innerHeight;
            width = height * gameRatio;
        }

        this.scale.setParentSize(width, height);
        this.scale.scaleMode = Phaser.Scale.FIT;
        this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();
        // --- End Scaling Setup ---

        // Initialize groups
        this.enemies = this.add.group();
        this.towers = this.add.group();

        // Initialize UI
        this.ui = new UI(this);
        this.lives = gameStore.get('lives');
        this.ui.updateLivesDisplay(this.lives);

        // Placeholder Grid and Path Drawing
        this.drawGrid();
        this.path = this.createPath();
        this.drawPath(this.path);

        // Initialize Hero
        this.hero = new Hero(this, GAME_CONFIG.HERO_CONFIG);

        // Event listeners
        this.events.on('enemyLeaked', this.handleEnemyLeaked, this);
        this.events.on('enemyKilled', this.handleEnemyKilled, this);
        this.events.on('heroDied', this.handleGameOver, this);

        // Initial tower placement (example)
        this.addTower(GAME_CONFIG.TILE_SIZE * 2.5, GAME_CONFIG.TILE_SIZE * 2.5, GAME_CONFIG.RACES.HUMAN);
        this.addTower(GAME_CONFIG.TILE_SIZE * 7.5, GAME_CONFIG.TILE_SIZE * 4.5, GAME_CONFIG.RACES.ORC);

        // Start first wave
        this.time.delayedCall(2000, this.startNextWave, [], this);

        // Physics overlap for towers and enemies (for range detection)
        this.physics.add.overlap(this.towers, this.enemies);
        // Physics overlap for hero and enemies (for hero attacking)
        this.physics.add.overlap(this.hero, this.enemies);

        // For debugging: Simulate purchase and check flags
        console.log("GameStore: isAdFree =", gameStore.get('isAdFree'));
        console.log("GameStore: hasDoubleGoldPass =", gameStore.get('hasDoubleGoldPass'));
        // gameStore.set('hasDoubleGoldPass', true); // Uncomment to test double gold pass
        // gameStore.set('isAdFree', true); // Uncomment to test ad-free
        console.log("Active upgrades after game start:", gameStore.activeUpgrades);

        // Example: Purchase starting gold upgrade
        // gameStore.purchaseUpgrade('starting_gold_bonus');
        // this.ui.updateGoldDisplay();
    }

    update(time, delta) {
        if (this.isGameOver) {
            return;
        }

        // Update all active game objects
        this.enemies.getChildren().forEach(enemy => enemy.update(time, delta));
        this.towers.getChildren().forEach(tower => tower.update(time, delta));
        this.hero.update(time, delta);
    }

    drawGrid() {
        const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x222222, alpha: 0.5 } });
        const numCols = Math.floor(GAME_CONFIG.GAME_WIDTH / GAME_CONFIG.TILE_SIZE);
        const numRows = Math.floor(GAME_CONFIG.GAME_HEIGHT / GAME_CONFIG.TILE_SIZE);

        for (let i = 0; i < numCols; i++) {
            graphics.strokeLine(i * GAME_CONFIG.TILE_SIZE, 0, i * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.GAME_HEIGHT);
        }
        for (let i = 0; i < numRows; i++) {
            graphics.strokeLine(0, i * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.GAME_WIDTH, i * GAME_CONFIG.TILE_SIZE);
        }
    }

    createPath() {
        // Placeholder path: a simple S-curve or zigzag
        const path = this.add.path(GAME_CONFIG.TILE_SIZE * 0.5, GAME_CONFIG.TILE_SIZE * 0.5); // Start top-left
        path.lineTo(GAME_CONFIG.TILE_SIZE * 0.5, GAME_CONFIG.TILE_SIZE * 7.5);
        path.lineTo(GAME_CONFIG.TILE_SIZE * 9.5, GAME_CONFIG.TILE_SIZE * 7.5);
        path.lineTo(GAME_CONFIG.TILE_SIZE * 9.5, GAME_CONFIG.TILE_SIZE * 15.5); // End near bottom-right
        return path;
    }

    drawPath(path) {
        const graphics = this.add.graphics({ lineStyle: { width: 10, color: 0x888888, alpha: 0.7 } });
        path.draw(graphics);
    }

    addTower(x, y, raceConfig) {
        const tower = new Tower(this, x, y, raceConfig);
        this.towers.add(tower);
        console.log(`Placed a ${tower.towerType} at (${x}, ${y})`);
    }

    spawnEnemy(enemyTypeConfig) {
        const enemy = new Enemy(this, this.path, enemyTypeConfig);
        this.enemies.add(enemy);
        console.log(`Spawned a ${enemy.enemyType}`);
    }

    startNextWave() {
        if (this.isGameOver) return;

        this.waveNumber++;
        this.ui.updateWaveDisplay(this.waveNumber);
        console.log(`Starting Wave ${this.waveNumber}`);

        // Example wave composition
        let totalEnemies = 5 + (this.waveNumber * 2);
        let spawnedCount = 0;

        const spawnInterval = this.time.addEvent({
            delay: 750, // Spawn an enemy every 0.75 seconds
            callback: () => {
                const enemyType = spawnedCount % 3 === 0 ? GAME_CONFIG.ENEMY_TYPES.GHOUL_RUSHER : GAME_CONFIG.ENEMY_TYPES.MURLOC_SCOUT;
                this.spawnEnemy(enemyType);
                spawnedCount++;
                if (spawnedCount >= totalEnemies) {
                    spawnInterval.destroy();
                    // Wait for all enemies to be defeated or leak
                    this.time.delayedCall(5000, this.checkWaveCompletion, [], this);
                }
            },
            repeat: totalEnemies - 1
        });
    }

    checkWaveCompletion() {
        if (this.enemies.getLength() === 0 && !this.isGameOver) {
            console.log(`Wave ${this.waveNumber} completed!`);
            // Reward gold for wave completion (applied BEFORE double gold hook)
            let waveReward = 100 + (this.waveNumber * 20);
            gameStore.addGold(waveReward); // GameStore handles the double gold pass hook
            this.ui.updateGoldDisplay();

            this.time.delayedCall(5000, this.startNextWave, [], this); // Start next wave after delay
        } else if (!this.isGameOver) {
            this.time.delayedCall(3000, this.checkWaveCompletion, [], this); // Recheck if enemies are still alive
        }
    }

    handleEnemyLeaked() {
        this.lives--;
        this.ui.updateLivesDisplay(this.lives);
        console.log(`Enemy leaked! Lives remaining: ${this.lives}`);
        if (this.lives <= 0) {
            this.handleGameOver();
        }
    }

    handleEnemyKilled(goldValue, xpValue) {
        let finalGold = goldValue + gameStore.activeUpgrades.gold_per_kill_flat_bonus;
        gameStore.addGold(finalGold); // GameStore handles the double gold pass hook
        this.ui.updateGoldDisplay();
        this.hero.addXP(xpValue);
    }

    handleGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        console.log("GAME OVER!");
        // Display game over screen
        const gameOverText = this.add.text(GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2, 'GAME OVER', {
            fontSize: '100px',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 12
        }).setOrigin(0.5).setDepth(100);

        this.physics.pause(); // Pause all physics operations
        // Optionally, reset GameStore or offer restart
    }
}