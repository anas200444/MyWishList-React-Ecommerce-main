import React, { useState, useContext } from "react";
import { ShopContext } from "../../context/shop-context";
import "./gameplay.css";

export const GamePlay = () => {
  const { addToWallet } = useContext(ShopContext);
  const [score, setScore] = useState(0);

  const handleClick = () => {
    setScore((prev) => prev + 1);
  };

  const handleCollect = () => {
    addToWallet(score);
    setScore(0);
    alert(`You collected ${score} JD!`);
  };

  return (
    <div className="gameplay">
      <h1>Click to Collect Money!</h1>
      <p>Current Score: {score}</p>
      <button className="game-button" onClick={handleClick}>
        Click Me
      </button>
      <button className="collect-button" onClick={handleCollect}>
        Collect Money
      </button>
    </div>
  );
};
