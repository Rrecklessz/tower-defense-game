class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, enemyTypeConfig) {
        // Create placeholder graphic (e.g., a circle)
        const radius = GAME_CONFIG.TILE_SIZE / 4;
        const graphics = scene.add.graphics();
        graphics.fillStyle(enemyTypeConfig.color, 1);
        graphics.fillCircle(0, 0, radius);
        // We'll use this graphic as a texture for the sprite
        graphics.generateTexture(enemyTypeConfig.assetKey + '_graphic', radius * 2, radius * 2);
        graphics.destroy(); // Destroy the graphics object, keep the texture

        super(scene, path, 0, 0, enemyTypeConfig.assetKey + '_graphic'); // Start at 0,0 for path follower
        this.scene = scene;
        this.enemyType = enemyTypeConfig.name;
        this.stats = { ...enemyTypeConfig.stats }; // Copy stats to allow individual modifications
        this.currentHealth = this.stats.health;
        this.goldValue = this.stats.goldValue;
        this.bountyXP = this.stats.bountyXP;

        scene.add.existing(this);
        scene.physics.world.enable(this); // Enable physics for collision detection
        this.body.setCircle(radius);
        this.setOrigin(0.5); // Center the origin
        this.startFollow({
            duration: (path.getLength() / this.stats.speed) * 1000, // Calculate duration based on path length and speed
            yoyo: false,
            repeat: 0,
            rotateToPath: true,
            onComplete: this.reachedEndOfPath,
            scope: this
        });
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.die();
            return true;
        }
        // Visual feedback for damage taken (e.g., flash red)
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            onComplete: () => { this.tint = 0xffffff; } // Reset tint
        });
        return false;
    }

    die() {
        // Stop following path, disable body
        this.stopFollow();
        this.body.enable = false;
        // Reward gold and XP
        this.scene.events.emit('enemyKilled', this.goldValue, this.bountyXP);
        // Play death animation/sound (placeholder)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.1,
            duration: 300,
            onComplete: () => {
                this.destroy(); // Remove enemy from scene
            }
        });
    }

    reachedEndOfPath() {
        console.log(`${this.enemyType} reached the end of the path!`);
        this.scene.events.emit('enemyLeaked'); // Notify MainScene
        this.destroy();
    }

    update(time, delta) {
        // Any specific enemy update logic (e.g., poison effects, special abilities)
    }
}