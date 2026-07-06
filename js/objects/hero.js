// src/objects/Hero.js

class Hero extends Phaser.GameObjects.Graphics {
    constructor(scene, x, y, stats) {
        super(scene);
        this.scene = scene;

        this.x = x;
        this.y = y;

        this.stats = {
            health: stats.initialHealth,
            maxHealth: stats.initialHealth,
            attack: stats.initialAttack,
            range: stats.initialRange,
            speed: stats.initialSpeed,
            level: 1,
            xp: 0,
            xpToNextLevel: stats.xpToLevel[0],
            xpToLevelArray: stats.xpToLevel
        };

        this.targetEnemy = null;
        this.nextAttack = 0;
        this.attackRate = 1000;

        this.movementTarget = new Phaser.Math.Vector2(x, y);

        this.drawHero();
        this.drawHealthBar();

        scene.add.existing(this);
    }

    drawHero() {
        this.clear();
        this.fillStyle(0xFFD700, 1);
        this.fillTriangle(-20, 20, 20, 20, 0, -20);
        this.lineStyle(2, 0xFFFFFF, 0.8);
        this.strokeTriangle(-20, 20, 20, 20, 0, -20);
    }

    drawHealthBar() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        const barWidth = GAME_CONFIG.TILE_SIZE * 0.8;
        const barHeight = 15;
        const healthRatio = this.stats.health / this.stats.maxHealth;
        const healthColor = healthRatio > 0.6 ? 0x00FF00 : (healthRatio > 0.3 ? 0xFFFF00 : 0xFF0000);

        this.healthBar = this.scene.add.graphics();
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(-barWidth / 2, GAME_CONFIG.TILE_SIZE / 2, barWidth, barHeight);
        this.healthBar.fillStyle(healthColor, 1);
        this.healthBar.fillRect(-barWidth / 2, GAME_CONFIG.TILE_SIZE / 2, barWidth * healthRatio, barHeight);
        this.add(this.healthBar);
    }

    update(time, delta, enemies) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.movementTarget.x, this.movementTarget.y);
        if (distance > 5) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.movementTarget.x, this.movementTarget.y);
            this.x += Math.cos(angle) * this.stats.speed * (delta / 1000);
            this.y += Math.sin(angle) * this.stats.speed * (delta / 1000);
            this.setPosition(this.x, this.y);
            this.healthBar.setPosition(this.x, this.y);
        }

        if (!this.targetEnemy || !this.targetEnemy.active || Phaser.Math.Distance.Between(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y) > this.stats.range) {
            this.targetEnemy = this.findTarget(enemies);
        }

        if (this.targetEnemy && time > this.nextAttack) {
            this.attack(this.targetEnemy);
            this.nextAttack = time + this.attackRate;
        }
    }

    findTarget(enemies) {
        let closestEnemy = null;
        let minDistance = this.stats.range + 1;

        enemies.forEach(enemy => {
            if (!enemy.active) return;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.stats.range && distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
        return closestEnemy;
    }

    attack(enemy) {
        const attackLine = this.scene.add.line(0, 0, this.x, this.y, enemy.x, enemy.y, 0xFFD700, 0.8)
            .setOrigin(0)
            .setLineWidth(5)
            .setDepth(2);
        this.scene.tweens.add({
            targets: attackLine,
            alpha: 0,
            duration: 100,
            onComplete: () => attackLine.destroy()
        });
        this.scene.tweens.add({
            targets: this,
            scale: 1.1,
            duration: 50,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => this.setScale(1)
        });

        enemy.takeDamage(this.stats.attack, 'hero');
        this.gainXP(5);
    }

    gainXP(amount) {
        this.stats.xp += amount;
        if (this.stats.xp >= this.stats.xpToNextLevel && this.stats.level < this.stats.xpToLevelArray.length) {
            this.levelUp();
        }
    }

    levelUp() {
        this.stats.level++;
        console.log(`Hero Leveled Up! Level: ${this.stats.level}`);

        this.stats.maxHealth += 100;
        this.stats.health = this.stats.maxHealth;
        this.stats.attack += 10;
        this.stats.range += 20;
        this.stats.speed += 10;
        this.attackRate = Math.max(200, this.attackRate - 50);

        this.drawHealthBar();
        if (this.stats.level <= this.stats.xpToLevelArray.length) {
            this.stats.xpToNextLevel = this.stats.xpToLevelArray[this.stats.level - 1];
        } else {
            this.stats.xpToNextLevel = Infinity;
        }

        const particles = this.scene.add.particles('whiteCircleParticle');
        particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            gravityY: 0,
            quantity: 20,
            tint: 0xFFD700
        });
        this.scene.time.delayedCall(500, () => particles.destroy());
    }

    takeDamage(amount, damageType = 'normal') {
        this.stats.health -= amount;
        this.drawHealthBar();
        if (this.stats.health <= 0) {
            this.die();
        }
    }

    moveTo(x, y) {
        this.movementTarget.set(x, y);
    }

    die() {
        console.log('Hero Died!');
        this.destroy();
        this.scene.events.emit('heroDied');
    }

    destroy(fromScene) {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        super.destroy(fromScene);
    }
}
