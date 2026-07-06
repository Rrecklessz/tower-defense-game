// src/objects/UI.js

class UI extends Phaser.GameObjects.Container {
    constructor(scene, gameStore) {
        super(scene, 0, 0);
        this.scene = scene;
        this.gameStore = gameStore;
        this.setDepth(150);

        this.goldIcon = scene.add.circle(60, 60, 30, 0xFFD700);
        this.goldText = scene.add.text(100, 35, '', { fontSize: '48px', fill: '#FFD700', stroke: '#000', strokeThickness: 6 });
        this.add([this.goldIcon, this.goldText]);
        this.updateGold(this.gameStore.get('gold'));

        this.livesIcon = scene.add.circle(60, 140, 30, 0xFF0000);
        this.livesText = scene.add.text(100, 115, '', { fontSize: '48px', fill: '#FF0000', stroke: '#000', strokeThickness: 6 });
        this.add([this.livesIcon, this.livesText]);
        this.updateLives(GAME_CONFIG.STARTING_LIVES);

        this.waveIcon = scene.add.circle(60, 220, 30, 0xFFFFFF);
        this.waveText = scene.add.text(100, 195, '', { fontSize: '48px', fill: '#FFFFFF', stroke: '#000', strokeThickness: 6 });
        this.add([this.waveIcon, this.waveText]);
        this.updateWave(0);

        let buttonY = 70;
        const buttonX = GAME_CONFIG.GAME_WIDTH - 150;
        const buttonWidth = 250;
        const buttonHeight = 80;
        const buttonSpacing = 110;

        this.shopButtonBg = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x5500AA)
            .setInteractive()
            .on('pointerdown', () => this.scene.events.emit('openShop'));
        this.shopButtonText = scene.add.text(buttonX, buttonY, 'Shop', { fontSize: '48px', fill: '#FFFFFF', stroke: '#000', strokeThickness: 6 })
            .setOrigin(0.5);
        this.add([this.shopButtonBg, this.shopButtonText]);

        buttonY += buttonSpacing;
        this.buildHumanTowerButtonBg = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, GAME_CONFIG.RACES.HUMAN.color)
            .setInteractive()
            .on('pointerdown', () => this.scene.events.emit('startPlacingTower', GAME_CONFIG.RACES.HUMAN));
        this.buildHumanTowerButtonText = scene.add.text(buttonX, buttonY, 'Build Human', { fontSize: '36px', fill: '#FFFFFF', stroke: '#000', strokeThickness: 6 })
            .setOrigin(0.5);
        this.add([this.buildHumanTowerButtonBg, this.buildHumanTowerButtonText]);

        buttonY += buttonSpacing;
        this.buildOrcTowerButtonBg = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, GAME_CONFIG.RACES.ORC.color)
            .setInteractive()
            .on('pointerdown', () => this.scene.events.emit('startPlacingTower', GAME_CONFIG.RACES.ORC));
        this.buildOrcTowerButtonText = scene.add.text(buttonX, buttonY, 'Build Orc', { fontSize: '36px', fill: '#FFFFFF', stroke: '#000', strokeThickness: 6 })
            .setOrigin(0.5);
        this.add([this.buildOrcTowerButtonBg, this.buildOrcTowerButtonText]);

        buttonY += buttonSpacing;
        this.buildUndeadTowerButtonBg = scene.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, GAME_CONFIG.RACES.UNDEAD.color)
            .setInteractive()
            .on('pointerdown', () => this.scene.events.emit('startPlacingTower', GAME_CONFIG.RACES.UNDEAD));
        this.buildUndeadTowerButtonText = scene.add.text(buttonX, buttonY, 'Build Undead', { fontSize: '36px', fill: '#FFFFFF', stroke: '#000', strokeThickness: 6 })
            .setOrigin(0.5);
        this.add([this.buildUndeadTowerButtonBg, this.buildUndeadTowerButtonText]);

        let flagY = GAME_CONFIG.GAME_HEIGHT - 100;
        const flagX = 60;
        const flagFontSize = '28px';
        const flagColor = '#CCCCCC';

        this.adFreeFlagText = scene.add.text(flagX, flagY, `Ad-Free: ${this.gameStore.hasPremiumFlag('isAdFree') ? 'YES' : 'NO'}`, { fontSize: flagFontSize, fill: flagColor, stroke: '#000', strokeThickness: 4 });
        this.add(this.adFreeFlagText);

        flagY += 40;
        this.doubleGoldFlagText = scene.add.text(flagX, flagY, `Double Gold: ${this.gameStore.hasPremiumFlag('hasDoubleGoldPass') ? 'YES' : 'NO'}`, { fontSize: flagFontSize, fill: flagColor, stroke: '#000', strokeThickness: 4 });
        this.add(this.doubleGoldFlagText);

        scene.add.existing(this);
    }

    updateGold(gold) {
        this.goldText.setText(`Gold: ${gold}`);
    }

    updateLives(lives) {
        this.livesText.setText(`Lives: ${lives}`);
    }

    updateWave(waveNumber) {
        this.waveText.setText(`Wave: ${waveNumber}`);
    }

    updateMonetizationFlags() {
        this.adFreeFlagText.setText(`Ad-Free: ${this.gameStore.hasPremiumFlag('isAdFree') ? 'YES' : 'NO'}`);
        this.doubleGoldFlagText.setText(`Double Gold: ${this.gameStore.hasPremiumFlag('hasDoubleGoldPass') ? 'YES' : 'NO'}`);
    }
}
