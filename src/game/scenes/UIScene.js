export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: false });
  }

  create() {
    const { width } = this.scale;

    // HP bar background
    this._hpBg = this.add.rectangle(16, 16, 120, 10, 0x000000, 0.6).setOrigin(0);
    this._hpBar = this.add.rectangle(16, 16, 120, 10, 0x10b981).setOrigin(0);
    this._hpText = this.add.text(16, 30, 'HP', {
      fontFamily: 'Cinzel, serif',
      fontSize: '9px',
      color: '#94a3b8',
      letterSpacing: 2,
    });

    // Save indicator (hidden by default)
    this._saveText = this.add.text(width - 12, 12, 'Saved', {
      fontFamily: 'Cinzel, serif',
      fontSize: '9px',
      color: '#10b981',
      letterSpacing: 2,
    }).setOrigin(1, 0).setAlpha(0);

    this.events.on('updateHP', this._updateHP, this);
    this.events.on('showSaved', this._flashSaved, this);
  }

  _updateHP(current, max) {
    const pct = Math.max(0, current / Math.max(max, 1));
    const color = pct > 0.6 ? 0x10b981 : pct > 0.25 ? 0xf59e0b : 0xef4444;
    this._hpBar.setDisplaySize(120 * pct, 10).setFillStyle(color);
  }

  _flashSaved() {
    this._saveText.setAlpha(1);
    this.tweens.add({
      targets: this._saveText,
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeIn',
      delay: 800,
    });
  }
}
