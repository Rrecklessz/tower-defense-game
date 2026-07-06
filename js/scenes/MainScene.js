// js/scenes/MainScene.js

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.gameStore = gameStore;
        this.lives = GAME_CONFIG.STARTING_LIVES;
        this.currentWaveIndex = 0;
        this.enemiesInWave = 0;
        this.enemiesSpawned = 0;
        this.waveActive = false;
        this.nextWaveTimer = null;
        this.tileGrid = [];
        this.isGameOver = false;
        this.currentPlacingTower = null;
        this.enemyPathGraphics = null;
    }

    preload() {
        // Load placeholder image assets
        this.load.image('human_tower', 'js/assets/human_tower.png');
        this.load.image('orc_totem', 'js/assets/orc_totem.png');
        this.load.image('undead_spire', 'js/assets/undead_spire.png');
        this.load.image('murloc_scout', 'js/assets/murloc_scout.png');
        this.load.image('ghoul_rusher', 'js/assets/ghoul_rusher.png');
        this.load.image('abomination_tank', 'js/assets/abomination_tank.png');
        this.load.image('hero_sprite', 'js/assets/hero_sprite.png');


        // Generate generic particle texture (must be done after base image loads if using image,
        // or can be done directly with graphics as below if not dependent on external image)
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(0, 0, 8);
        graphics.generateTexture('whiteCircleParticle', 16, 16);
        graphics.destroy();
    }

    create() {
        console.log('MainScene created.');

        this.lives = GAME_CONFIG.STARTING_LIVES;
        this.currentWaveIndex = 0;
        this.isGameOver = false;

        const startingGoldBonus = this.gameStore.getUpgradeEffectValue('starting_gold_bonus');
        this.gameStore.set('gold', GAME_CONFIG.STARTING_GOLD + startingGoldBonus);

        this.add.rectangle(0, 0, GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT, 0x1A1A1A)
            .setOrigin(0);

        this.drawGrid();

        this.towers = this.add.group();
        this.enemies = this.add.group();
        this.projectiles = this.add.group();

        const heroInitialHP = GAME_CONFIG.HERO_STATS.initialHealth + this.gameStore.getUpgradeEffectValue('hero_starting_hp');
        this.hero = new Hero(this, GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT - 200, {
            ...GAME_CONFIG.HERO_STATS,
            initialHealth: heroInitialHP
        });
        this.add.existing(this.hero);

        this.ui = new UI(this, this.gameStore);
        this.shopUI = new ShopUI(this, this.gameStore);
        this.add.existing(this.shopUI);

        this.ui.updateGold(this.gameStore.get('gold'));
        this.ui.updateLives(this.lives);
        this.ui.updateWave(this.currentWaveIndex);
        this.ui.updateMonetizationFlags();

        this.enemyPath = this.createEnemyPath();
        this.drawPath(this.enemyPath);

        this.time.delayedCall(2000, this.startNextWave, [], this);

        this.input.on('pointerdown', this.handleInput, this);
        this.input.on('pointermove', this.handleInput, this);

        this.events.on('openShop', this.shopUI.show, this.shopUI);
        this.events.on('startPlacingTower', this.startPlacingTower, this);
        this.events.on('enemyDeath', this.handleEnemyDeath, this);
        this.events.on('heroDied', this.gameOver, this);
    }

    update(time, delta) {
        if (this.isGameOver) {
            return;
        }

        this.hero.update(time, delta, this.enemies.getChildren());
        this.towers.getChildren().forEach(tower => tower.update(time, delta, this.enemies.getChildren()));
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
            if (enemy.isAtEndOfPath()) {
                enemy.destroy();
                this.lives--;
                this.ui.updateLives(this.lives);
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        if (this.waveActive && this.enemiesInWave === 0 && this.enemies.countActive(true) === 0) {
            console.log('Wave complete!');
            this.waveActive = false;
            const waveData = GAME_CONFIG.WAVES[this.currentWaveIndex - 1];
            const baseWaveReward = GAME_CONFIG.BASE_GOLD_REWARD * this.currentWaveIndex;
            const finalWaveReward = this.gameStore.calculateGoldReward(baseWaveReward * (waveData ? waveData.waveRewardMultiplier : 1));
            this.gameStore.addGold(finalWaveReward);
            this.ui.updateGold(this.gameStore.get('gold'));
            this.showTemporaryMessage(`+${finalWaveReward} Gold!`, this.ui.goldText.x + 100, this.ui.goldText.y + 50, '#FFD700');

            this.time.delayedCall(5000, this.startNextWave, [], this);
        }
    }

    drawGrid() {
        const graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x004400, alpha: 0.5 } });
        for (let y = 0; y < GAME_CONFIG.GRID_ROWS; y++) {
            this.tileGrid[y] = [];
            for (let x = 0; x < GAME_CONFIG.GRID_COLS; x++) {
                const rect = new Phaser.Geom.Rectangle(x * GAME_CONFIG.TILE_SIZE, y * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                graphics.strokeRectShape(rect);
                this.tileGrid[y][x] = { x, y, occupied: false, type: 'empty' };
            }
        }
    }

    createEnemyPath() {
        const path = this.add.path(GAME_CONFIG.GAME_WIDTH / 2, -50);
        path.lineTo(GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT * 0.2);
        path.quadraticBezierCurveTo(GAME_CONFIG.GAME_WIDTH * 0.8, GAME_CONFIG.GAME_HEIGHT * 0.3, GAME_CONFIG.GAME_WIDTH * 0.8, GAME_CONFIG.GAME_HEIGHT * 0.5);
        path.quadraticBezierCurveTo(GAME_CONFIG.GAME_WIDTH * 0.2, GAME_CONFIG.GAME_HEIGHT * 0.7, GAME_CONFIG.GAME_WIDTH * 0.2, GAME_CONFIG.GAME_HEIGHT * 0.9);
        path.lineTo(GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT + 50);
        return path;
    }

    drawPath(path) {
        if (this.enemyPathGraphics) {
            this.enemyPathGraphics.destroy();
        }
        this.enemyPathGraphics = this.add.graphics();
        this.enemyPathGraphics.lineStyle(20, 0x555555, 0.7);
        path.draw(this.enemyPathGraphics, 32);
    }

    startNextWave() {
        if (this.isGameOver) return;

        this.currentWaveIndex++;
        const waveData = GAME_CONFIG.WAVES[this.currentWaveIndex - 1];

        if (!waveData) {
            console.log('All defined waves completed! Entering endless mode.');
            this.generateEndlessWave();
            return;
        }

        console.log(`Starting Wave ${waveData.waveNumber}`);
        this.ui.updateWave(this.currentWaveIndex);
        this.waveActive = true;
        this.enemiesSpawned = 0;
        this.enemiesInWave = waveData.enemies.reduce((sum, config) => sum + config.count, 0);

        let delay = 0;
        waveData.enemies.forEach(enemyTypeConfig => {
            for (let i = 0; i < enemyTypeConfig.count; i++) {
                this.time.delayedCall(delay, this.spawnEnemy, [enemyTypeConfig.type], this);
                delay += enemyTypeConfig.delay;
            }
        });
    }

    generateEndlessWave() {
        this.currentWaveIndex++;
        this.ui.updateWave(this.currentWaveIndex);
        console.log(`Starting Endless Wave ${this.currentWaveIndex}`);
        this.waveActive = true;
        this.enemiesSpawned = 0;

        const baseEnemyCount = 10;
        const additionalEnemiesPerWave = 3;
        const totalEnemies = baseEnemyCount + (this.currentWaveIndex * additionalEnemiesPerWave);
        this.enemiesInWave = totalEnemies;

        let delay = 0;
        for (let i = 0; i < totalEnemies; i++) {
            const enemyType = (i % 4 === 0 && this.currentWaveIndex > 5) ? 'abomination_tank' : ((i % 2 === 0) ? 'ghoul_rusher' : 'murloc_scout');
            this.time.delayedCall(delay, this.spawnEnemy, [enemyType], this);
            delay += 800 - Math.min(600, this.currentWaveIndex * 15);
        }
    }

    spawnEnemy(enemyTypeKey) {
        const enemyConfig = GAME_CONFIG.ENEMIES[enemyTypeKey.toUpperCase()];
        if (!enemyConfig) {
            console.error('Unknown enemy type:', enemyTypeKey);
            return;
        }
        const enemy = new Enemy(this, this.enemyPath, enemyConfig);
        this.enemies.add(enemy);
        this.add.existing(enemy);
        enemy.startFollowingPath();
        this.enemiesSpawned++;
    }

    handleEnemyDeath(enemy, goldAmount, xpAmount) {
        console.log(`Enemy died, adding ${goldAmount} gold and ${xpAmount} XP.`);
        this.gameStore.addGold(goldAmount);
        this.ui.updateGold(this.gameStore.get('gold'));
        this.showTemporaryMessage(`+${goldAmount} Gold`, enemy.x, enemy.y - 40, '#FFD700');
        this.hero.gainXP(xpAmount);
        this.enemiesInWave--;
    }

    handleInput(pointer) {
        if (this.shopUI.visible) {
            return;
        }

        if (this.currentPlacingTower) {
            this.updatePlacingTowerPosition(pointer);
        } else {
            if (pointer.isDown) {
                this.hero.moveTo(pointer.x, pointer.y);
            }
        }
    }

    startPlacingTower(raceConfig) {
        if (this.currentPlacingTower) {
            this.currentPlacingTower.destroy();
        }

        const cost = raceConfig.stats.cost;
        if (this.gameStore.get('gold') < cost) {
            this.showTemporaryMessage('Not enough gold!', GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2, '#FF0000');
            return;
        }

        this.currentPlacingTower = new Tower(this, 0, 0, raceConfig, true);
        this.currentPlacingTower.setAlpha(0.5);
        this.currentPlacingTower.setDepth(100);
        this.add.existing(this.currentPlacingTower);
    }

    updatePlacingTowerPosition(pointer) {
        if (this.currentPlacingTower) {
            const tileX = Math.floor(pointer.x / GAME_CONFIG.TILE_SIZE);
            const tileY = Math.floor(pointer.y / GAME_CONFIG.TILE_SIZE);

            if (tileX >= 0 && tileX < GAME_CONFIG.GRID_COLS && tileY >= 0 && tileY < GAME_CONFIG.GRID_ROWS) {
                const snappedX = tileX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
                const snappedY = tileY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
                this.currentPlacingTower.setPosition(snappedX, snappedY);

                const tile = this.tileGrid[tileY][tileX];
                const isValidPlacement = !tile.occupied && !this.isPathTile(tileX, tileY);
                this.currentPlacingTower.setTint(isValidPlacement ? 0x00FF00 : 0xFF0000);

                if (!pointer.isDown && pointer.upX !== 0 && pointer.upY !== 0) {
                    this.placeTower(pointer, this.currentPlacingTower.raceConfig);
                }
            }
        }
    }

    placeTower(pointer, raceConfig) {
        if (!this.currentPlacingTower) return;

        const tileX = Math.floor(pointer.x / GAME_CONFIG.TILE_SIZE);
        const tileY = Math.floor(pointer.y / GAME_CONFIG.TILE_SIZE);

        if (tileX >= 0 && tileX < GAME_CONFIG.GRID_COLS && tileY >= 0 && tileY < GAME_CONFIG.GRID_ROWS) {
            const tile = this.tileGrid[tileY][tileX];
            const isValidPlacement = !tile.occupied && !this.isPathTile(tileX, tileY);

            if (isValidPlacement && this.gameStore.spendGold(raceConfig.stats.cost)) {
                const newTower = new Tower(this, tile.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2, tile.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2, raceConfig, false);
                this.towers.add(newTower);
                this.add.existing(newTower);
                tile.occupied = true;
                tile.type = 'tower';
                console.log(`Placed ${raceConfig.name} tower at (${tileX}, ${tileY})`);
                this.currentPlacingTower.destroy();
                this.currentPlacingTower = null;
                this.ui.updateGold(this.gameStore.get('gold'));
                return;
            } else if (!isValidPlacement) {
                this.showTemporaryMessage('Cannot build here!', GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2 + 100, '#FF0000');
            } else {
                this.showTemporaryMessage('Not enough gold!', GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2 + 100, '#FF0000');
            }
        }
        this.currentPlacingTower.destroy();
        this.currentPlacingTower = null;
    }

    isPathTile(tileX, tileY) {
        const pathPoints = this.enemyPath.getSpacedPoints(10);
        const tileRect = new Phaser.Geom.Rectangle(tileX * GAME_CONFIG.TILE_SIZE, tileY * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);

        for (const point of pathPoints) {
            const pathNodeRect = new Phaser.Geom.Rectangle(point.x - GAME_CONFIG.TILE_SIZE / 3, point.y - GAME_CONFIG.TILE_SIZE / 3, GAME_CONFIG.TILE_SIZE * 2 / 3, GAME_CONFIG.TILE_SIZE * 2 / 3);
            if (Phaser.Geom.Intersects.RectangleToRectangle(tileRect, pathNodeRect)) {
                return true;
            }
        }
        return false;
    }

    showTemporaryMessage(message, x, y, color = '#FFFFFF') {
        const text = this.add.text(x, y, message, {
            fontSize: '50px',
            fill: color,
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(250);

        this.tweens.add({
            targets: text,
            y: y - 100,
            alpha: 0,
            duration: 1500,
            ease: 'Sine.easeOut',
            onComplete: () => text.destroy()
        });
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        console.log('Game Over!');
        this.physics.pause();
        this.scene.input.off('pointerdown', this.handleInput);
        this.scene.input.off('pointermove', this.handleInput);

        const gameOverText = this.add.text(GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2, 'GAME OVER', {
            fontSize: '100px',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 12
        }).setOrigin(0.5).setDepth(250);

        const restartButton = this.add.text(GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2 + 150, 'Restart', {
            fontSize: '60px',
            fill: '#00FF00',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(250)
            .setInteractive()
            .on('pointerdown', () => this.restartGame());
    }

    restartGame() {
        console.log('Restarting game...');
        this.gameStore.resetSessionState();
        this.time.removeAllEvents();
        this.enemies.clear(true, true);
        this.towers.clear(true, true);
        this.projectiles.clear(true, true);

        this.scene.restart();
    }
}
