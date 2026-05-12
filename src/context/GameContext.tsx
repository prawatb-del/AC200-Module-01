import React, { createContext, useContext, useState, ReactNode } from 'react';

export type GameStep = 'HOME' | 'AUTH' | 'LEVEL_SELECT' | 'GAMEPLAY' | 'RESULT' | 'ADMIN';

export interface ScenarioLog {
  scenarioId: number;
  timeTaken: number; // in seconds
  score: number;
  attempts: number;
}

export interface GameState {
  currentLevel: number;
  totalScore: number;
  completedLevels: number[];
  playerName: string;
  playerEmail?: string;
  isLoggedIn: boolean;
  scenariosLog: ScenarioLog[];
  sessionStartTime: number | null;
}

interface GameContextType {
  currentStep: GameStep;
  setStep: (step: GameStep) => void;
  gameState: GameState;
  updateGameState: (data: Partial<GameState>) => void;
  resetGame: () => void;
}

const defaultGameState: GameState = {
  currentLevel: 1,
  totalScore: 0,
  completedLevels: [],
  playerName: '',
  playerEmail: '',
  isLoggedIn: false,
  scenariosLog: [],
  sessionStartTime: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setStep] = useState<GameStep>('HOME');
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  const updateGameState = (data: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...data }));
  };

  const resetGame = () => {
    setGameState(defaultGameState);
  };

  return (
    <GameContext.Provider
      value={{
        currentStep,
        setStep,
        gameState,
        updateGameState,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
