// src/objects/Tower.js

class Tower extends Phaser.GameObjects.Graphics {
    constructor(scene, x, y, raceConfig, isGhost = false) {
        super(scene);
        this.scene = scene;
        this.raceConfig = raceConfig;
        this.isGhost = isGhost;

        this.x = x;
        this.y = y;

        const atkBonusLevel = this.scene.gameStore.getUpgradeLevel('all_towers_atk_bonus');
        const atkBonusValue = SHOP_CONFIG.PERMANENT_UPGRADES['all_towers_atk_bonus'].effect(atkBonusLevel);

        this.stats = {
            attack: raceConfig.stats.attack + atkBonusValue,
            range: raceConfig.stats.range,
            fireRate: raceConfig.stats.fireRate,
            cost: raceConfig.stats.cost
        };
        if (raceConfig.stats.splashRadius) this.stats.splashRadius = raceConfig.stats.splashRadius;
        if (raceConfig.stats.poisonDuration) this.stats.poisonDuration = raceConfig.stats.poisonDuration;
        if (raceConfig.stats.poisonTickDamage) this.stats.poisonTickDamage = raceConfig.stats.poisonTickDamage;

        this.nextFire = 0;

        this.drawTower();
        if (!isGhost) {
            this.rangeIndicator = scene.add.circle(x, y, this.stats.range, 0x00FF00, 0.1)
                .setDepth(0);
            this.add(this.rangeIndicator);
        }
        scene.add.existing(this);
    }

    drawTower() {
        this.clear();
        this.fillStyle(this.raceConfig.color, 1);
        this.fillCircle(0, 0, GAME_CONFIG.TILE_SIZE / 3);

        this.lineStyle(2, 0xFFFFFF, 0.8);
        this.strokeCircle(0, 0, GAME_CONFIG.TILE_SIZE / 3);

        if (this.raceConfig.id === GAME_CONFIG.RACES.HUMAN.id) {
            this.fillStyle(0xFFFFFF, 0.8);
            this.fillTriangle(0, -GAME_CONFIG.TILE_SIZE / 3, -GAME_CONFIG.TILE_SIZE / 6, 0, GAME_CONFIG.TILE_SIZE / 6, 0);
        } else if (this.raceConfig.id === GAME_CONFIG.RACES.ORC.id) {
            this.fillStyle(0x8B4513, 1);
            this.fillRect(-GAME_CONFIG.TILE_SIZE / 8, -GAME_CONFIG.TILE_SIZE / 2, GAME_CONFIG.TILE_SIZE / 4, GAME_CONFIG.TILE_SIZE / 2);
            this.fillStyle(0xFFFFFF, 0.7);
            this.fillTriangle(-GAME_CONFIG.TILE_SIZE / 8, -GAME_CONFIG.TILE_SIZE / 2, GAME_CONFIG.TILE_SIZE / 8, -GAME_CONFIG.TILE_SIZE / 2, 0, -GAME_CONFIG.TILE_SIZE / 1.5);
        } else if (this.raceConfig.id === GAME_CONFIG.RACES.UNDEAD.id) {
            this.fillStyle(0x333333, 1);
            this.fillEllipse(0, 0, GAME_CONFIG.TILE_SIZE / 2.5, GAME_CONFIG.TILE_SIZE / 1.5);
            this.fillStyle(0x00FF00, 0.5);
            this.fillCircle(0, -GAME_CONFIG.TILE_SIZE / 2.5, GAME_CONFIG.TILE_SIZE / 6);
        }
    }

    update(time, delta, enemies) {
        if (this.isGhost) return;

        if (time > this.nextFire) {
            let target = this.findTarget(enemies);
            if (target) {
                this.fire(target);
                this.nextFire = time + this.stats.fireRate;
            }
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

    fire(target) {
        let projectileColor = 0xFFFFFF;
        let projectileDuration = 200;

        if (target && target.active) {
            projectileDuration = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) / 0.8;

            if (this.raceConfig.id === GAME_CONFIG.RACES.HUMAN.id) {
                projectileColor = 0x8800FF;
                const projectile = this.scene.add.circle(this.x, this.y, 8, projectileColor).setDepth(2);
                this.scene.tweens.add({
                    targets: projectile,
                    x: target.x,
                    y: target.y,
                    duration: projectileDuration,
                    onComplete: (tween, targets) => {
                        targets[0].destroy();
                        if (target && target.active) {
                            target.takeDamage(this.stats.attack, 'arcane');
                        }
                    }
                });
                this.scene.tweens.add({
                    targets: this,
                    scale: 1.1,
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut',
                    onComplete: () => this.setScale(1)
                });

            } else if (this.raceConfig.id === GAME_CONFIG.RACES.ORC.id) {
                projectileColor = 0x00FF00;
                const projectile = this.scene.add.circle(this.x, this.y, 10, projectileColor).setDepth(2);
                this.scene.tweens.add({
                    targets: projectile,
                    x: target.x,
                    y: target.y,
                    duration: projectileDuration,
                    onComplete: (tween, targets) => {
                        targets[0].destroy();
                        if (target && target.active) {
                            this.scene.tweens.add({
                                targets: this.scene.add.circle(target.x, target.y, this.stats.splashRadius, 0x00FF00, 0.2).setDepth(1),
                                scale: { from: 0, to: 1 },
                                alpha: { from: 0.8, to: 0 },
                                duration: 150,
                                onComplete: (t, objs) => objs[0].destroy()
                            });

                            this.scene.enemies.getChildren().forEach(enemy => {
                                const distance = Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y);
                                if (distance <= this.stats.splashRadius && enemy.active) {
                                    enemy.takeDamage(this.stats.attack, 'nature');
                                }
                            });
                        }
                    }
                });
                this.scene.tweens.add({
                    targets: this,
                    angle: { from: -5, to: 5 },
                    duration: 80,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Sine.easeInOut',
                    onComplete: () => this.setAngle(0)
                });
            } else if (this.raceConfig.id === GAME_CONFIG.RACES.UNDEAD.id) {
                projectileColor = 0xAA00FF;
                const projectile = this.scene.add.circle(this.x, this.y, 6, projectileColor).setDepth(2);
                this.scene.tweens.add({
                    targets: projectile,
                    x: target.x,
                    y: target.y,
                    duration: projectileDuration * 0.5,
                    onComplete: (tween, targets) => {
                        targets[0].destroy();
                        if (target && target.active) {
                            target.takeDamage(this.stats.attack, 'shadow');
                            target.applyPoison(this.stats.poisonDuration, this.stats.poisonTickDamage);
                        }
                    }
                });
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 1, to: 0.8 },
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut',
                    onComplete: () => this.setAlpha(1)
                });
            }
        }
    }

    destroy(fromScene) {
        if (this.rangeIndicator) {
            this.rangeIndicator.destroy(fromScene);
        }
        super.destroy(fromScene);
    }
}
