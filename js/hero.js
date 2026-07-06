class Hero extends Phaser.GameObjects.Container {
    constructor(scene, heroConfig) {
        super(scene, GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2); // Start in center
        this.scene = scene;
        this.heroName = heroConfig.name;
        this.stats = { ...heroConfig.initialStats }; // Base stats
        this.levelUpBonus = heroConfig.levelUpBonus;
        this.currentHealth = this.stats.health;
        this.currentXP = 0;
        this.xpToNextLevel = this.stats.xpToNextLevel;
        this.nextAttackTime = 0;
        this.target = null;

        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.body.setCircle(GAME_CONFIG.TILE_SIZE / 3); // Hero collision body
        this.body.setAllowGravity(false);
        this.body.setImmovable(false); // Can be moved by input
        this.body.debugShowBody = false;

        // Apply permanent upgrades to hero's starting stats
        this.currentHealth += gameStore.activeUpgrades.hero_starting_hp;
        this.stats.health = this.currentHealth; // Update base health too if needed

        // Hero visual (placeholder: colored triangle)
        const heroSize = GAME_CONFIG.TILE_SIZE / 2;
        this.graphic = scene.add.graphics();
        this.graphic.fillStyle(heroConfig.color, 1);
        this.graphic.fillTriangle(-heroSize / 2, heroSize / 2, heroSize / 2, heroSize / 2, 0, -heroSize / 2);
        this.add(this.graphic);

        // Health Bar (placeholder)
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
        this.add(this.healthBar);

        // Input handling for movement
        this.scene.input.on('pointermove', this.handlePointerMove, this);
        // Prevent hero from going off-screen
        this.body.setCollideWorldBounds(true);
        this.scene.physics.world.setBounds(0, 0, GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT);
    }

    handlePointerMove(pointer) {
        if (pointer.isDown) { // Only move if pointer is held down
            this.scene.physics.moveTo(this, pointer.x, pointer.y, this.stats.movementSpeed);
        } else {
            this.body.setVelocity(0, 0); // Stop if pointer is not down
        }
    }

    update(time, delta) {
        // Stop hero if it reached the pointer target and pointer is not down
        if (!this.scene.input.activePointer.isDown && this.body.speed > 0) {
            this.body.setVelocity(0, 0);
        }

        if (time > this.nextAttackTime) {
            this.acquireTarget();
            if (this.target) {
                this.attack(time);
                this.nextAttackTime = time + this.stats.attackSpeed;
            }
        }
        this.updateHealthBar(); // Keep health bar updated
    }

    acquireTarget() {
        const enemies = this.scene.enemies.getChildren();
        let closestEnemy = null;
        let closestDistance = this.stats.attackRange + 1;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.stats.attackRange && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        this.target = closestEnemy;
    }

    attack(time) {
        if (!this.target || !this.target.active) {
            this.target = null;
            return;
        }

        // Hero attacks the target
        this.target.takeDamage(this.stats.damage);

        // Visual feedback for attack (e.g., glow, line to enemy)
        const attackLine = this.scene.add.graphics();
        attackLine.lineStyle(4, 0xffa500, 1); // Orange line
        attackLine.beginPath();
        attackLine.moveTo(this.x, this.y);
        attackLine.lineTo(this.target.x, this.target.y);
        attackLine.strokePath();

        this.scene.tweens.add({
            targets: attackLine,
            alpha: 0,
            duration: 150,
            onComplete: () => attackLine.destroy()
        });
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth <= 0) {
            this.die();
        }
        this.updateHealthBar();
        // Visual feedback for damage taken
        this.scene.tweens.add({
            targets: this.graphic,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            onComplete: () => { this.graphic.tint = 0xffffff; }
        });
    }

    updateHealthBar() {
        this.healthBar.clear();
        const barWidth = GAME_CONFIG.TILE_SIZE;
        const barHeight = 10;
        const healthPercentage = this.currentHealth / this.stats.health;

        // Background bar
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(-barWidth / 2, -heroSize / 2 - barHeight - 5, barWidth, barHeight);

        // Health fill
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(-barWidth / 2, -heroSize / 2 - barHeight - 5, barWidth * healthPercentage, barHeight);
    }

    addXP(amount) {
        this.currentXP += amount;
        console.log(`Hero gained ${amount} XP. Total: ${this.currentXP}`);
        if (this.currentXP >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.stats.level++;
        this.currentXP -= this.xpToNextLevel; // Carry over excess XP
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5); // XP required increases

        this.stats.health += this.levelUpBonus.health;
        this.currentHealth = this.stats.health; // Heal to full on level up
        this.stats.damage += this.levelUpBonus.damage;
        this.stats.attackRange += this.levelUpBonus.attackRange;
        this.stats.attackSpeed = Math.max(100, this.stats.attackSpeed - this.levelUpBonus.attackSpeedReduction); // Min 100ms attack speed

        console.log(`Hero leveled up! Level: ${this.stats.level}, HP: ${this.stats.health}, Damage: ${this.stats.damage}`);

        // Visual feedback for level up (e.g., particle burst)
        const particles = this.scene.add.particles('star'); // Assuming a 'star' particle texture
        particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            gravityY: 0,
            quantity: 20
        });
        this.scene.time.delayedCall(500, () => particles.destroy());
    }

    die() {
        console.log("Hero has fallen!");
        // Game over or hero respawn logic
        this.setVisible(false);
        this.scene.events.emit('heroDied');
    }
}