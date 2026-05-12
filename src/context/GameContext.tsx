import React, { createContext, useContext, useState, ReactNode } from 'react';

export type GameStep = 'HOME' | 'SETUP' | 'QUIZ' | 'RESULT' | 'ADMIN';

export interface PlayerData {
  brandName: string;
  activity: string;
  businessType: string;
  annualRevenue: number;
  initialCapital: number;
  totalScore: number;
  email?: string;
}

interface GameContextType {
  currentStep: GameStep;
  setStep: (step: GameStep) => void;
  playerData: PlayerData;
  setPlayerData: (data: Partial<PlayerData>) => void;
  answers: any[];
  setAnswers: (answers: any[]) => void;
}

const defaultPlayerData: PlayerData = {
  brandName: '',
  activity: '',
  businessType: '',
  annualRevenue: 0,
  initialCapital: 0,
  totalScore: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setStep] = useState<GameStep>('HOME');
  const [playerData, setPlayerDataState] = useState<PlayerData>(defaultPlayerData);
  const [answers, setAnswers] = useState<any[]>([]);

  const setPlayerData = (data: Partial<PlayerData>) => {
    setPlayerDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <GameContext.Provider
      value={{
        currentStep,
        setStep,
        playerData,
        setPlayerData,
        answers,
        setAnswers,
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
