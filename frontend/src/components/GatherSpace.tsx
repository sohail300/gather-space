import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const GatherSpace: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createMainScene = (): Phaser.Scene => {
      return class MainScene extends Phaser.Scene {
        private player!: Phaser.Physics.Arcade.Sprite;
        private stars!: Phaser.Physics.Arcade.Group;
        private bombs!: Phaser.Physics.Arcade.Group;
        private platforms!: Phaser.Physics.Arcade.StaticGroup;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private score = 0;
        private gameOver = false;
        private scoreText!: Phaser.GameObjects.Text;

        constructor() {
          super({ key: 'MainScene' });
        }

        preload() {
          this.load.image('sky', 'assets/sky.png');
          this.load.image('ground', 'assets/platform.png');
          this.load.image('star', 'assets/star.png');
          this.load.image('bomb', 'assets/bomb.png');
          this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        }

        create() {
          // Background
          this.add.image(400, 300, 'sky');

          // Platforms
          this.platforms = this.physics.add.staticGroup();
          this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
          this.platforms.create(600, 400, 'ground');
          this.platforms.create(50, 250, 'ground');
          this.platforms.create(750, 220, 'ground');

          // Player
          this.player = this.physics.add.sprite(100, 450, 'dude');
          this.player.setBounce(0.2);
          this.player.setCollideWorldBounds(true);

          // Animations
          this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
          });

          this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
          });

          this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
          });

          // Input
          this.cursors = this.input.keyboard.createCursorKeys();

          // Stars
          this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
          });

          this.stars.children.entries.forEach((child: Phaser.Physics.Arcade.Sprite) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          });

          // Bombs
          this.bombs = this.physics.add.group();

          // Score
          this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#000' });

          // Colliders
          this.physics.add.collider(this.player, this.platforms);
          this.physics.add.collider(this.stars, this.platforms);
          this.physics.add.collider(this.bombs, this.platforms);

          // Overlaps
          this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
          this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);
        }

        update() {
          if (this.gameOver) return;

          if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
          } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
          } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
          }

          if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
          }
        }

        private collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Sprite) {
          star.disableBody(true, true);

          this.score += 10;
          this.scoreText.setText('Score: ' + this.score);

          if (this.stars.countActive(true) === 0) {
            this.stars.children.entries.forEach((child: Phaser.Physics.Arcade.Sprite) => {
              child.enableBody(true, child.x, 0, true, true);
            });

            const x = (player.x < 400) 
              ? Phaser.Math.Between(400, 800) 
              : Phaser.Math.Between(0, 400);

            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
          }
        }

        private hitBomb(player: Phaser.Physics.Arcade.Sprite, bomb: Phaser.Physics.Arcade.Sprite) {
          this.physics.pause();
          player.setTint(0xff0000);
          player.anims.play('turn');
          this.gameOver = true;
        }
      };
    };

    // Phaser configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: parentEl.current!,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: createMainScene()
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup
    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div
      ref={parentEl}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default GatherSpace;