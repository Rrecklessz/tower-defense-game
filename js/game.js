const config = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.GAME_WIDTH,
    height: GAME_CONFIG.GAME_HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container', // If you have a specific div for the game
        width: GAME_CONFIG.GAME_WIDTH,
        height: GAME_CONFIG.GAME_HEIGHT,
        zoom: 1, // Set zoom to 1 and let Phaser handle internal scaling
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // Set to true for physics debug visuals
            gravity: { y: 0 }
        }
    },
    scene: [MainScene]
};

const game = new Phaser.Game(config);

// Handle window resize for responsiveness beyond Phaser's internal scaling
window.addEventListener('resize', () => {
    // Only if using Phaser.Scale.RESIZE for dynamic resizing, otherwise FIT handles it
    // If you need more complex resizing logic not covered by FIT, implement here.
});