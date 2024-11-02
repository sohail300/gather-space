import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const GatherSpace: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createMainScene = (): Phaser.Scene => {
      return class MainScene extends Phaser.Scene {
        private player!: Phaser.Physics.Arcade.Sprite;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

        constructor() {
          super({ key: "MainScene" });
        }

        preload() {
          this.load.tilemapTiledJSON("map", "assets/mapv1.json");
          this.load.image("sky", "assets/sky.png");
          this.load.image("tiles1", "assets/tiles1.png");
          this.load.image("tiles2", "assets/tiles2.png");

          this.load.spritesheet("dude", "assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
          });
        }

        create() {
          console.log("run");
          const map = this.make.tilemap({ key: "map" });
          console.log(map);

          const tileset1 = map.addTilesetImage("tiles1", "tiles1");
          const tileset2 = map.addTilesetImage("tiles2", "tiles2");

          // Create layers with the loaded tilesets
          const layerNames = [
            "Grass, Pond",
            "Trees",
            "windows",
            "floor",
            "Boundary",
            "tables",
            "stairs",
            "upper trees",
          ];

          layerNames.forEach((layerName) => {
            map.createLayer(layerName, [tileset1, tileset2], 0, 0);
          });

          // Player
          this.player = this.physics.add.sprite(560, 760, "dude");
          this.player.setBounce(0.2);
          this.player.setCollideWorldBounds(true);

          // Animations
          this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
              start: 0,
              end: 3,
            }),
            frameRate: 10,
            repeat: -1,
          });

          this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
          });

          this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
              start: 5,
              end: 8,
            }),
            frameRate: 10,
            repeat: -1,
          });

          // Input
          this.cursors = this.input.keyboard.createCursorKeys();
        }

        update() {
          if (this.gameOver) return;

          if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("left", true);
          } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("right", true);
          } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
            this.player.anims.play("turn");
          } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
            this.player.anims.play("turn");
          } else {
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.player.anims.play("turn");
          }
        }
      };
    };

    // Phaser configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 960,
      height: 1056,
      parent: parentEl.current!,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: createMainScene(),
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
        width: "100%",
        height: "100%",
        margin: "0 auto",
        padding: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  );
};

export default GatherSpace;
