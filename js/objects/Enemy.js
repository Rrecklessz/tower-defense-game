// js/objects/Enemy.js

class Enemy extends Phaser.GameObjects.Container {
    constructor(scene, path, enemyConfig) {
        super(scene, 0, 0);
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

        this.sprite = scene.add.sprite(0, 0, this.spriteKey);
        const baseSpriteSize = GAME_CONFIG.TILE_SIZE * 0.6;
        const scale = baseSpriteSize / Math.max(this.sprite.width, this.sprite.height);
        this.sprite.setScale(scale);
        this.add(this.sprite);

        this.healthBar = this.scene.add.graphics();
        this.add(this.healthBar);
        this.drawHealthBar();

        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.body.setCircle(this.sprite.width * scale / 2);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.debugShowBody = false;
    }

    drawHealthBar() {
        if (this.healthBar) {
            this.healthBar.clear();
        }
        const barWidth = this.sprite.width * this.sprite.scaleX;
        const barHeight = 8;
        const healthRatio = this.health / this.maxHealth;
        const healthColor = healthRatio > 0.6 ? 0x00FF00 : (healthRatio > 0.3 ? 0xFFFF00 : 0xFF0000);

        const barYOffset = -this.sprite.height * this.sprite.scaleY / 2 - barHeight - 5;

        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(-barWidth / 2, barYOffset, barWidth, barHeight);
        this.healthBar.fillStyle(healthColor, 1);
        this.healthBar.fillRect(-barWidth / 2, barYOffset, barWidth * healthRatio, barHeight);
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

        if (this.isPoisoned && time > this.poisonLastTickTime + 1000) {
            this.takeDamage(this.poisonTickDamage, 'poison');
            this.poisonLastTickTime = time;
        }
    }

    takeDamage(amount, damageType = 'normal') {
        this.health -= amount;
        this.drawHealthBar();

        this.scene.tweens.add({
            targets: this.sprite,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            onComplete: () => { this.sprite.tint = 0xffffff; }
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
        this.sprite.setTint(0x5500FF);

        if (!this.poisonEffectGraphic) {
            this.poisonEffectGraphic = this.scene.add.circle(0, 0, this.sprite.width * this.sprite.scaleX / 2, 0x5500FF, 0.3)
                .setDepth(1);
            this.add(this.poisonEffectGraphic);
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
            this.sprite.clearTint();
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
