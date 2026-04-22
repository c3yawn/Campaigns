export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.setBaseURL(window.location.origin);
    this.load.setPath(base + 'game/');

    this._createLoadingBar();

    this.load.image('tiles', 'tilesets/tileset.png');
    this.load.tilemapTiledJSON('map', 'maps/world.json');

    // Player spritesheet (48x48 frames, 4-direction walk cycle)
    this.load.spritesheet('player', 'sprites/player.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    this.scene.start('Game');
  }

  _createLoadingBar() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    const bar = this.add.graphics();
    const border = this.add.graphics();

    border.lineStyle(2, 0x7c3aed, 1);
    border.strokeRect(cx - 160, cy - 12, 320, 24);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0x7c3aed, 1);
      bar.fillRect(cx - 158, cy - 10, 316 * value, 20);
    });

    this.add.text(cx, cy - 32, 'Loading…', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#a78bfa',
      letterSpacing: 3,
    }).setOrigin(0.5);
  }
}
