class UI extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        scene.add.existing(this);

        this.goldText = this.scene.add.text(50, 50, 'Gold: ' + gameStore.get('gold'), {
            fontSize: '48px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 8
        }).setScrollFactor(0); // Fixed position on screen

        this.waveText = this.scene.add.text(50, 120, 'Wave: ' + gameStore.get('currentWave'), {
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 8
        }).setScrollFactor(0);

        this.livesText = this.scene.add.text(GAME_CONFIG.GAME_WIDTH - 50, 50, 'Lives: ' + gameStore.get('lives'), {
            fontSize: '48px',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(1, 0).setScrollFactor(0);

        // Placeholder for monetization flags display
        this.adFreeText = this.scene.add.text(50, GAME_CONFIG.GAME_HEIGHT - 100,
            `Ad-Free: ${gameStore.get('isAdFree') ? 'Yes' : 'No'}`, {
            fontSize: '32px',
            fill: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);

        this.doubleGoldText = this.scene.add.text(50, GAME_CONFIG.GAME_HEIGHT - 50,
            `Double Gold: ${gameStore.get('hasDoubleGoldPass') ? 'Yes' : 'No'}`, {
            fontSize: '32px',
            fill: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);
    }

    updateGoldDisplay() {
        this.goldText.setText('Gold: ' + gameStore.get('gold'));
    }

    updateWaveDisplay(waveNumber) {
        this.waveText.setText('Wave: ' + waveNumber);
    }

    updateLivesDisplay(lives) {
        this.livesText.setText('Lives: ' + lives);
    }

    // You can add methods for other UI elements like upgrade buttons, menus etc.
    showUpgradeButton(x, y, upgradeId, callback) {
        // Placeholder for a button
        const button = this.scene.add.graphics();
        button.fillStyle(0x0066AA, 1);
        button.fillRoundedRect(x, y, 200, 80, 16);
        button.setInteractive(new Phaser.Geom.Rectangle(x, y, 200, 80), Phaser.Geom.Rectangle.Contains);

        const text = this.scene.add.text(x + 100, y + 40, `Upgrade ${upgradeId}`, {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            callback(upgradeId);
        });

        this.add([button, text]);
    }
}