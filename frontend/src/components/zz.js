import React, { useEffect } from "react";
import Phaser from "phaser";
import withPayment from "./withPayment";

const Game = ({ onGameOver }) => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    let game = new Phaser.Game(config);

    function preload() {
      console.log("Preloading assets...");
      this.load.image("logo", "/assets/catto.png");
    }

    function create() {
      console.log("Creating game scene...");
      this.add.image(400, 300, "logo");
    }

    function update() {
      // Game logic
    }

    return () => {
      game.destroy(true); // Optional: Ensure the Phaser instance is cleaned up
    };
  }, [onGameOver]);
  const handleGameOver = () => {
    if (onGameOver) onGameOver(); // Trigger the onGameOver function passed as prop
  };
  return (
    <div id="phaser-game" style={{ width: "100%", height: "100%" }}>
      {" "}
      <button
        onClick={handleGameOver}
        style={{ position: "absolute", top: "10px", left: "10px" }}
      >
        Trigger Game Over
      </button>
    </div>
  );
};

export default withPayment(Game, "/game2");
