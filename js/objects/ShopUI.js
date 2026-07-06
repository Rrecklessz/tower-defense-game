// src/objects/ShopUI.js

class ShopUI extends Phaser.GameObjects.Container {
    constructor(scene, gameStore) {
        super(scene, GAME_CONFIG.GAME_WIDTH / 2, GAME_CONFIG.GAME_HEIGHT / 2);
        this.scene = scene;
        this.gameStore = gameStore;
        this.setDepth(200);
        this.setVisible(false);

        this.background = scene.add.rectangle(0, 0, GAME_CONFIG.GAME_WIDTH * 0.8, GAME_CONFIG.GAME_HEIGHT * 0.8, 0x000000, 0.9)
            .setOrigin(0.5);
        this.add(this.background);

        this.titleText = scene.add.text(0, -this.background.height / 2 + 50, 'Permanent Upgrades', { fontSize: '60px', fill: '#FFD700' })
            .setOrigin(0.5);
        this.add(this.titleText);

        this.closeButton = scene.add.text(this.background.width / 2 - 50, -this.background.height / 2 + 50, 'X', { fontSize: '50px', fill: '#FF0000' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.hide());
        this.add(this.closeButton);

        this.upgradeItems = scene.add.group();
        this.add(this.upgradeItems);

        this.populateShop();
    }

    populateShop() {
        this.upgradeItems.clear(true, true);

        let yOffset = -this.background.height / 2 + 150;

        for (const upgradeId in SHOP_CONFIG.PERMANENT_UPGRADES) {
            const config = SHOP_CONFIG.PERMANENT_UPGRADES[upgradeId];
            const currentLevel = this.gameStore.getUpgradeLevel(upgradeId);
            const maxLevel = config.maxLevel;
            const isMaxLevel = currentLevel >= maxLevel;

            const nextCost = isMaxLevel ? 'MAX' : Math.round(config.baseCost * Math.pow(config.costMultiplier, currentLevel));

            const itemContainer = this.scene.add.container(0, yOffset);
            this.add(itemContainer);

            const itemBg = this.scene.add.rectangle(0, 0, this.background.width * 0.7, 150, 0x333333, 0.7)
                .setOrigin(0.5);
            itemContainer.add(itemBg);

            const nameText = this.scene.add.text(-itemBg.width / 2 + 20, -50, config.name, { fontSize: '40px', fill: '#FFFFFF' })
                .setOrigin(0);
            itemContainer.add(nameText);

            const descText = this.scene.add.text(-itemBg.width / 2 + 20, -5, config.description, { fontSize: '28px', fill: '#CCCCCC', wordWrap: { width: itemBg.width * 0.6 } })
                .setOrigin(0);
            itemContainer.add(descText);

            const levelText = this.scene.add.text(itemBg.width / 2 - 20, -50, `Level: ${currentLevel}/${maxLevel}`, { fontSize: '30px', fill: '#9999FF' })
                .setOrigin(1, 0);
            itemContainer.add(levelText);

            const costText = this.scene.add.text(itemBg.width / 2 - 20, 10, `Cost: ${nextCost} Gold`, { fontSize: '36px', fill: '#FFD700' })
                .setOrigin(1, 0);
            itemContainer.add(costText);

            const buyButton = this.scene.add.rectangle(0, 50, itemBg.width * 0.3, 60, isMaxLevel ? 0x666666 : 0x00AA00)
                .setOrigin(0.5)
                .setInteractive({ enabled: !isMaxLevel })
                .on('pointerdown', () => this.buyUpgrade(upgradeId));
            itemContainer.add(buyButton);

            const buttonText = this.scene.add.text(0, 50, isMaxLevel ? 'MAX' : 'BUY', { fontSize: '36px', fill: '#FFFFFF' })
                .setOrigin(0.5);
            itemContainer.add(buttonText);

            yOffset += 180;
        }
    }

    buyUpgrade(upgradeId) {
        if (this.gameStore.applyUpgrade(upgradeId)) {
            this.populateShop();
            this.scene.ui.updateGold(this.gameStore.get('gold'));
            this.scene.showTemporaryMessage(`Upgraded ${SHOP_CONFIG.PERMANENT_UPGRADES[upgradeId].name}!`, this.x, this.y - 300, '#00FF00');
        } else {
            this.scene.showTemporaryMessage('Not enough gold!', this.x, this.y + 300, '#FF0000');
        }
    }

    show() {
        this.setVisible(true);
        this.populateShop();
        this.scene.tweens.add({
            targets: this,
            scale: { from: 0.8, to: 1 },
            alpha: { from: 0, to: 1 },
            ease: 'Back.easeOut',
            duration: 300
        });
    }

    hide() {
        this.scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 0.8 },
            alpha: { from: 1, to: 0 },
            ease: 'Back.easeIn',
            duration: 300,
            onComplete: () => {
                this.setVisible(false);
            }
        });
    }
}
