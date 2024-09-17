import React, { createContext, useState, useContext } from 'react';

// Create a GameContext
const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [isGameOngoing, setIsGameOngoing] = useState(false);

  return (
    <GameContext.Provider value={{ isGameOngoing, setIsGameOngoing }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use GameContext
export const useGameContext = () => {
  return useContext(GameContext);
};
