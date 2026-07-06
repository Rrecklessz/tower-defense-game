// js/objects/Tower.js

class Tower extends Phaser.GameObjects.Container {
    constructor(scene, x, y, raceConfig, isGhost = false) {
        super(scene, x, y);
        this.scene = scene;
        this.raceConfig = raceConfig;
        this.isGhost = isGhost;

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

        this.sprite = scene.add.sprite(0, 0, raceConfig.spriteKey);
        const baseSpriteSize = GAME_CONFIG.TILE_SIZE * 0.8;
        const scale = baseSpriteSize / Math.max(this.sprite.width, this.sprite.height);
        this.sprite.setScale(scale);
        this.add(this.sprite);

        scene.physics.world.enable(this);
        this.body.setCircle(this.stats.range);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.debugShowBody = false;

        if (!isGhost) {
            this.rangeIndicator = scene.add.circle(0, 0, this.stats.range, 0x00FF00, 0.1)
                .setDepth(0);
            this.add(this.rangeIndicator);
            this.rangeIndicator.setVisible(false);
        }
        scene.add.existing(this);
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
        let projectileSpeed = 800;

        if (target && target.active) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            const projectileDuration = (distance / projectileSpeed) * 1000;

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
                    targets: this.sprite,
                    scaleX: { from: this.sprite.scaleX, to: this.sprite.scaleX * 1.1 },
                    scaleY: { from: this.sprite.scaleY, to: this.sprite.scaleY * 1.1 },
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
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
                                const distToSplashCenter = Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y);
                                if (distToSplashCenter <= this.stats.splashRadius && enemy.active) {
                                    enemy.takeDamage(this.stats.attack, 'nature');
                                }
                            });
                        }
                    }
                });
                this.scene.tweens.add({
                    targets: this.sprite,
                    angle: { from: -5, to: 5 },
                    duration: 80,
                    yoyo: true,
                    repeat: 2,
                    ease: 'Sine.easeInOut',
                    onComplete: () => this.sprite.setAngle(0)
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
                    targets: this.sprite,
                    alpha: { from: 1, to: 0.8 },
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut',
                    onComplete: () => this.sprite.setAlpha(1)
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
```The elite mobile game engineering swarm is now operating in full autonomous mode. I will proceed immediately, making all necessary assumptions and utilizing tools to complete the task.

**Autonomous Action: Verifying Codebase Synchronization & Planning Next Features**

I will perform a comprehensive fetch and review of your entire GitHub repository. The primary goal is to **confirm that the previous extensive code updates and manual file system corrections (deleting duplicates, moving files to correct subfolders, renaming with proper casing) have been applied and pushed to your repository.**

Once this synchronization is confirmed, I will autonomously identify the next phase of development based on our initial project decomposition and begin generating the necessary code.

**Proceeding with File Retrieval for Verification:**
