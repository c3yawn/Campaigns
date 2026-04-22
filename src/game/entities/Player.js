const SPEED = 160;

const ANIMS = {
  down:  { frames: [0, 1, 2, 3],   key: 'walk-down'  },
  left:  { frames: [4, 5, 6, 7],   key: 'walk-left'  },
  right: { frames: [8, 9, 10, 11], key: 'walk-right' },
  up:    { frames: [12,13,14,15],  key: 'walk-up'    },
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    // Shrink physics body to feet area
    this.body.setSize(24, 16).setOffset(12, 28);

    this._registerAnims(scene);
    this._facing = 'down';
  }

  _registerAnims(scene) {
    Object.values(ANIMS).forEach(({ key, frames }) => {
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers('player', { frames }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });
  }

  update(cursors, wasd) {
    const left  = cursors.left.isDown  || wasd.left.isDown;
    const right = cursors.right.isDown || wasd.right.isDown;
    const up    = cursors.up.isDown    || wasd.up.isDown;
    const down  = cursors.down.isDown  || wasd.down.isDown;

    let vx = 0, vy = 0;

    if (left)  { vx = -SPEED; this._facing = 'left';  }
    if (right) { vx =  SPEED; this._facing = 'right'; }
    if (up)    { vy = -SPEED; this._facing = 'up';    }
    if (down)  { vy =  SPEED; this._facing = 'down';  }

    // Normalise diagonal speed
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.anims.play(ANIMS[this._facing].key, true);
    } else {
      this.anims.stop();
      this.setFrame(ANIMS[this._facing].frames[0]);
    }
  }

  getState() {
    return { x: Math.round(this.x), y: Math.round(this.y), facing: this._facing };
  }

  loadState(state) {
    if (!state) return;
    this.setPosition(state.x ?? this.x, state.y ?? this.y);
    this._facing = state.facing ?? 'down';
  }
}
