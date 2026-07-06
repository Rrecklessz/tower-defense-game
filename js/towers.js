class Tower extends Phaser.GameObjects.Container {
    constructor(scene, x, y, towerTypeConfig) {
        super(scene, x, y);
        this.scene = scene;
        this.towerType = towerTypeConfig.name;
        this.stats = { ...towerTypeConfig.stats }; // Copy stats for individual upgrades
        this.projectileSpeed = towerTypeConfig.stats.projectileSpeed;
        this.fireRate = towerTypeConfig.stats.fireRate; // ms
        this.nextFireTime = 0;
        this.target = null; // Current target

        scene.add.existing(this);
        scene.physics.world.enable(this); // Enable physics for range detection (if using circle body)
        this.body.setCircle(this.stats.range); // Range as a physics body
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.debugShowBody = false; // Hide physics debug body

        // Tower Base (placeholder: colored circle)
        const baseRadius = GAME_CONFIG.TILE_SIZE / 3;
        this.base = scene.add.graphics();
        this.base.fillStyle(0x333333, 1);
        this.base.fillCircle(0, 0, baseRadius);
        this.add(this.base);

        // Tower Cannon/Top (placeholder: colored square/circle)
        const topSize = GAME_CONFIG.TILE_SIZE / 2;
        this.top = scene.add.graphics();
        this.top.fillStyle(towerTypeConfig.color, 1);
        this.top.fillRoundedRect(-topSize / 2, -topSize / 2, topSize, topSize, 8);
        this.add(this.top);

        // Tower Range Indicator (optional, for debugging or placement preview)
        this.rangeIndicator = scene.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 0.3 } });
        this.rangeIndicator.strokeCircle(0, 0, this.stats.range);
        this.add(this.rangeIndicator);
        this.rangeIndicator.setVisible(false); // Hide by default

        // Placeholder for asset-key sprite, will replace the graphics later
        // this.sprite = scene.add.sprite(0, 0, towerTypeConfig.assetKey);
        // this.add(this.sprite);
    }

    update(time, delta) {
        if (time > this.nextFireTime) {
            this.acquireTarget();
            if (this.target) {
                this.fire(time);
                this.nextFireTime = time + this.fireRate;
            }
        }
    }

    acquireTarget() {
        // Find closest enemy within range
        const enemies = this.scene.enemies.getChildren(); // Assuming MainScene manages an enemies group
        let closestEnemy = null;
        let closestDistance = this.stats.range + 1; // Start slightly outside range

        for (const enemy of enemies) {
            if (!enemy.active) continue; // Skip inactive enemies
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.stats.range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        this.target = closestEnemy;
    }

    fire(time) {
        if (!this.target || !this.target.active) {
            this.target = null;
            return;
        }

        // Rotate tower top to face target (placeholder visual)
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        this.top.rotation = angle + Math.PI / 2; // Adjust for graphic's initial orientation

        // Projectile (placeholder: glowing particle arc / simple circle)
        const projectile = this.scene.add.graphics();
        projectile.fillStyle(0xffff00, 1); // Yellow glowing
        projectile.fillCircle(0, 0, 10);
        projectile.setDepth(1); // Above enemies
        projectile.x = this.x;
        projectile.y = this.y;

        // Path / Tween the projectile
        this.scene.tweens.add({
            targets: projectile,
            x: this.target.x,
            y: this.target.y,
            duration: Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) / this.projectileSpeed * 1000,
            ease: 'Linear',
            onComplete: () => {
                if (this.target && this.target.active) {
                    this.target.takeDamage(this.stats.damage * gameStore.activeUpgrades.global_tower_atk_multiplier);
                    // Add specific effects based on tower type (e.g., poison, splash)
                    if (this.towerType === GAME_CONFIG.RACES.UNDEAD.name) {
                        // Apply poison logic here (e.g., add a status effect to the enemy)
                    } else if (this.towerType === GAME_CONFIG.RACES.ORC.name) {
                        // Apply splash damage logic here (e.g., find nearby enemies and damage them)
                    }
                }
                projectile.destroy(); // Remove projectile
            }
        });

        // Firing animation (e.g., a quick flash)
        this.scene.tweens.add({
            targets: this.top,
            scale: 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    showRange() {
        this.rangeIndicator.setVisible(true);
    }

    hideRange() {
        this.rangeIndicator.setVisible(false);
    }
}