/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TelemetryData {
  stroop: {
    trials: {
      delayMs: number;
      isCorrect: boolean;
      type: 'congruent' | 'incongruent';
    }[];
  };
  tileMatrix: {
    maxLevel: number;
    errors: {
      hesitationMs: number;
    }[];
  };
  rotationMatch: {
    trials: {
      delayMs: number;
      isCorrect: boolean;
      difficulty: number;
    }[];
  };
  gridContinuity: {
    trials: {
      solveTimeMs: number;
      isCorrect: boolean;
      stallTimeMs: number;
    }[];
  };
  reverseCommand: {
    trials: {
      delayMs: number;
      isCorrect: boolean;
      type: 'reverse' | 'normal';
      isImpulsive: boolean;
    }[];
  };
  chimpTest: {
    maxSpan: number;
    holdTimeMs: number;
    firstErrorIndex: number | null;
  };
}

export interface AIReport {
  neuralArchitecture: {
    focus: number;
    memory: number;
    spatial: number;
    pattern: number;
    impulse: number;
    workingMemory: number;
  };
  archetype: {
    name: string;
    title: string;
    description: string;
    icon: string;
  };
  deepProfile: string;
  bioHacks: string[];
  percentile: number;
}
