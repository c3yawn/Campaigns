import Player from '../entities/Player.js';
import { saveManager } from '../save/saveManager.js';

const SAVE_INTERVAL_MS = 30_000;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this._buildMap();
    this._spawnPlayer();
    this._setupCamera();
    this._setupInput();
    this._launchUI();
    this._loadSave();
    this._scheduleSave();
  }

  update() {
    this._player.update(this._cursors, this._wasd);
  }

  // ── Map ──────────────────────────────────────────────────────────────────

  _buildMap() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tiles');

    this._groundLayer = map.createLayer('Ground', tileset, 0, 0);
    this._wallLayer   = map.createLayer('Walls',  tileset, 0, 0);

    this._wallLayer.setCollisionByProperty({ collides: true });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  // ── Player ───────────────────────────────────────────────────────────────

  _spawnPlayer() {
    this._player = new Player(this, 100, 100);
    this.physics.add.collider(this._player, this._wallLayer);
  }

  // ── Camera ───────────────────────────────────────────────────────────────

  _setupCamera() {
    this.cameras.main
      .startFollow(this._player, true, 0.1, 0.1)
      .setZoom(2)
      .setBounds(0, 0, this.physics.world.bounds.width, this.physics.world.bounds.height);
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  _setupInput() {
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys({ left: 'A', right: 'D', up: 'W', down: 'S' });
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  _launchUI() {
    this.scene.launch('UI');
    this._ui = this.scene.get('UI');
    this._ui.events.emit('updateHP', 100, 100);
  }

  // ── Save / Load ───────────────────────────────────────────────────────────

  async _loadSave() {
    const save = await saveManager.load(1);
    if (save?.player) this._player.loadState(save.player);
  }

  _scheduleSave() {
    this.time.addEvent({
      delay: SAVE_INTERVAL_MS,
      loop: true,
      callback: this._doSave,
      callbackScope: this,
    });
  }

  async _doSave() {
    await saveManager.save(1, { player: this._player.getState() });
    this._ui?.events.emit('showSaved');
  }
}
