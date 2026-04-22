export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load only what PreloadScene's loading bar needs
    const base = import.meta.env.BASE_URL;
    this.load.setBaseURL(window.location.origin);
    this.load.setPath(base + 'game/');
  }

  create() {
    this.scene.start('Preload');
  }
}
