// src/objects/Enemy.js

class Enemy extends Phaser.GameObjects.Graphics {
    constructor(scene, path, enemyConfig) {
        super(scene);
        this.scene = scene;
        this.path = path;
        this.enemyConfig = enemyConfig;

        this.health = enemyConfig.health;
        this.maxHealth = enemyConfig.health;
        this.speed = enemyConfig.speed;
        this.goldReward = enemyConfig.goldReward;
        this.spriteKey = enemyConfig.spriteKey;
        this.color = enemyConfig.color;
        this.xpReward = enemyConfig.xpReward || Math.round(enemyConfig.health / 10);

        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };

        this.isPoisoned = false;
        this.poisonTimer = null;
        this.poisonTickDamage = 0;
        this.poisonLastTickTime = 0;
        this.poisonEffectGraphic = null;

        this.drawEnemy();
        this.drawHealthBar();

        scene.add.existing(this);
    }

    drawEnemy() {
        this.clear();
        this.fillStyle(this.color, 1);

        if (this.enemyConfig.id === 'abomination_tank') {
            this.fillRect(-GAME_CONFIG.TILE_SIZE / 3, -GAME_CONFIG.TILE_SIZE / 3, GAME_CONFIG.TILE_SIZE * 2 / 3, GAME_CONFIG.TILE_SIZE * 2 / 3);
            this.lineStyle(2, 0xFFFFFF, 0.8);
            this.strokeRect(-GAME_CONFIG.TILE_SIZE / 3, -GAME_CONFIG.TILE_SIZE / 3, GAME_CONFIG.TILE_SIZE * 2 / 3, GAME_CONFIG.TILE_SIZE * 2 / 3);
        } else {
            this.fillCircle(0, 0, GAME_CONFIG.TILE_SIZE / 4);
            this.lineStyle(2, 0xFFFFFF, 0.8);
            this.strokeCircle(0, 0, GAME_CONFIG.TILE_SIZE / 4);
        }
    }

    drawHealthBar() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        const barWidth = GAME_CONFIG.TILE_SIZE / 2;
        const barHeight = 10;
        const healthRatio = this.health / this.maxHealth;
        const healthColor = healthRatio > 0.6 ? 0x00FF00 : (healthRatio > 0.3 ? 0xFFFF00 : 0xFF0000);

        this.healthBar = this.scene.add.graphics();
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(-barWidth / 2, -GAME_CONFIG.TILE_SIZE / 3, barWidth, barHeight);
        this.healthBar.fillStyle(healthColor, 1);
        this.healthBar.fillRect(-barWidth / 2, -GAME_CONFIG.TILE_SIZE / 3, barWidth * healthRatio, barHeight);
        this.add(this.healthBar);
    }

    startFollowingPath() {
        this.scene.tweens.add({
            targets: this.follower,
            t: 1,
            ease: 'Linear',
            duration: (this.path.getLength() / this.speed) * 1000,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                this.reachedEndOfPath = true;
            }
        });
    }

    update(time, delta) {
        this.path.getPoint(this.follower.t, this.follower.vec);
        this.setPosition(this.follower.vec.x, this.follower.vec.y);
        this.healthBar.setPosition(this.follower.vec.x, this.follower.vec.y);
        if (this.poisonEffectGraphic) {
             this.poisonEffectGraphic.setPosition(this.follower.vec.x, this.follower.vec.y);
        }

        if (this.isPoisoned && time > this.poisonLastTickTime + 1000) {
            this.takeDamage(this.poisonTickDamage, 'poison');
            this.poisonLastTickTime = time;
        }
    }

    takeDamage(amount, damageType = 'normal') {
        this.health -= amount;
        this.drawHealthBar();

        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            onComplete: () => { this.tint = 0xffffff; }
        });

        if (this.health <= 0) {
            this.scene.events.emit('enemyDeath', this, this.goldReward, this.xpReward);
            this.destroy();
        }
    }

    applyPoison(duration, tickDamage) {
        if (this.isPoisoned) {
            this.scene.time.removeEvent(this.poisonTimer);
        }

        this.isPoisoned = true;
        this.poisonTickDamage = tickDamage;
        this.poisonLastTickTime = this.scene.time.now;
        this.setTint(0x5500FF);

        if (!this.poisonEffectGraphic) {
            this.poisonEffectGraphic = this.scene.add.circle(this.x, this.y, GAME_CONFIG.TILE_SIZE / 4, 0x5500FF, 0.3)
                .setDepth(1);
        } else {
            this.poisonEffectGraphic.setVisible(true);
            this.poisonEffectGraphic.setAlpha(0.3);
        }
        this.scene.tweens.add({
            targets: this.poisonEffectGraphic,
            alpha: { from: 0.3, to: 0.6 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        this.poisonTimer = this.scene.time.delayedCall(duration, () => {
            this.isPoisoned = false;
            this.clearTint();
            this.poisonTimer = null;
            if (this.poisonEffectGraphic) {
                this.poisonEffectGraphic.destroy();
                this.poisonEffectGraphic = null;
            }
        }, [], this);
    }

    isAtEndOfPath() {
        return this.follower.t >= 1;
    }

    destroy(fromScene) {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.poisonTimer) {
            this.poisonTimer.remove();
        }
        if (this.poisonEffectGraphic) {
            this.poisonEffectGraphic.destroy();
        }
        super.destroy(fromScene);
    }
}
