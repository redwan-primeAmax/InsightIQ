import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { WelcomePage } from './components/pages/WelcomePage';
import { GameOne_Stroop } from './components/pages/GameOne_Stroop';
import { GameTwo_TileMatrix } from './components/pages/GameTwo_TileMatrix';
import { GameThree_RotationMatch } from './components/pages/GameThree_RotationMatch';
import { GameFour_GridContinuity } from './components/pages/GameFour_GridContinuity';
import { GameFive_ReverseCommand } from './components/pages/GameFive_ReverseCommand';
import { GameSix_ChimpTest } from './components/pages/GameSix_ChimpTest';
import { ResultPage } from './components/pages/ResultPage';
import { TelemetryData } from './types';

type Screen = 'welcome' | 'game1' | 'game2' | 'game3' | 'game4' | 'game5' | 'game6' | 'result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [telemetry, setTelemetry] = useState<Partial<TelemetryData>>({});

  const handleUpdateTelemetry = useCallback((game: keyof TelemetryData, data: any) => {
    setTelemetry(prev => ({ ...prev, [game]: data }));
  }, []);

  const nextScreen = (current: Screen) => {
    const sequence: Screen[] = ['welcome', 'game1', 'game2', 'game3', 'game4', 'game5', 'game6', 'result'];
    const idx = sequence.indexOf(current);
    if (idx < sequence.length - 1) {
      setCurrentScreen(sequence[idx + 1]);
    }
  };

  return (
    <div className="bg-[#0B0B0F] min-h-screen">
      <AnimatePresence mode="wait">
        {currentScreen === 'welcome' && (
          <WelcomePage key="welcome" onStart={() => setCurrentScreen('game1')} />
        )}
        
        {currentScreen === 'game1' && (
          <GameOne_Stroop 
            key="game1" 
            onComplete={(data) => {
              handleUpdateTelemetry('stroop', data);
              nextScreen('game1');
            }} 
          />
        )}

        {currentScreen === 'game2' && (
          <GameTwo_TileMatrix 
            key="game2"
            onComplete={(data) => {
              handleUpdateTelemetry('tileMatrix', data);
              nextScreen('game2');
            }}
          />
        )}

        {currentScreen === 'game3' && (
          <GameThree_RotationMatch 
            key="game3"
            onComplete={(data) => {
                handleUpdateTelemetry('rotationMatch', data);
                nextScreen('game3');
            }}
          />
        )}

        {currentScreen === 'game4' && (
          <GameFour_GridContinuity 
            key="game4"
            onComplete={(data) => {
              handleUpdateTelemetry('gridContinuity', data);
              nextScreen('game4');
            }}
          />
        )}

        {currentScreen === 'game5' && (
          <GameFive_ReverseCommand 
            key="game5"
            onComplete={(data) => {
              handleUpdateTelemetry('reverseCommand', data);
              nextScreen('game5');
            }}
          />
        )}

        {currentScreen === 'game6' && (
          <GameSix_ChimpTest 
            key="game6"
            onComplete={(data) => {
              handleUpdateTelemetry('chimpTest', data);
              nextScreen('game6');
            }}
          />
        )}

        {currentScreen === 'result' && (
          <ResultPage key="result" telemetry={telemetry as TelemetryData} />
        )}
      </AnimatePresence>
    </div>
  );
}
