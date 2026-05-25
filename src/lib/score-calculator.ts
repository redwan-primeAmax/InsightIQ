export const computeScores = (telemetry: any) => {
  const scores = {
    focus: 0,
    memory: 0,
    spatial: 0,
    pattern: 0,
    impulse: 0,
    workingMemory: 0
  };

  if (!telemetry) return scores;

  // 1. Focus (Stroop)
  if (telemetry.stroop?.trials && telemetry.stroop.trials.length > 0) {
    const trials = telemetry.stroop.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.focus = Math.round((correct / trials.length) * 100);
  }

  // 2. Memory (TileMatrix)
  if (telemetry.tileMatrix?.maxLevel > 0) {
    const maxLevel = telemetry.tileMatrix.maxLevel;
    scores.memory = Math.round(Math.min((maxLevel / 8) * 100, 100));
  }

  // 3. Spatial (RotationMatch)
  if (telemetry.rotationMatch?.trials && telemetry.rotationMatch.trials.length > 0) {
    const trials = telemetry.rotationMatch.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.spatial = Math.round((correct / trials.length) * 100);
  }

  // 4. Pattern (GridContinuity)
  if (telemetry.gridContinuity?.trials && telemetry.gridContinuity.trials.length > 0) {
    const trials = telemetry.gridContinuity.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.pattern = Math.round((correct / trials.length) * 100);
  }

  // 5. Impulse (ReverseCommand)
  if (telemetry.reverseCommand?.trials && telemetry.reverseCommand.trials.length > 0) {
    const trials = telemetry.reverseCommand.trials;
    const correct = trials.filter((t: any) => t.isCorrect).length;
    scores.impulse = Math.round((correct / trials.length) * 100);
  }

  // 6. WorkingMemory (ChimpTest)
  if (telemetry.chimpTest?.maxSpan > 0) {
    const maxSpan = telemetry.chimpTest.maxSpan;
    scores.workingMemory = Math.round(Math.min((maxSpan / 10) * 100, 100));
  }

  return scores;
};
