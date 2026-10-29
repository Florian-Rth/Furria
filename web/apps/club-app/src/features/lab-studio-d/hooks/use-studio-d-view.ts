import { useState } from 'react';

export interface StudioDView {
  mirrored: boolean;
  stageFirst: boolean;
  stepsOpen: boolean;
  speedOpen: boolean;
  toggleMirror: () => void;
  swap: () => void;
  setStepsOpen: (open: boolean) => void;
  setSpeedOpen: (open: boolean) => void;
}

export const useStudioDView = (): StudioDView => {
  const [mirrored, setMirrored] = useState(true);
  const [stageFirst, setStageFirst] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);

  return {
    mirrored,
    stageFirst,
    stepsOpen,
    speedOpen,
    toggleMirror: () => {
      setMirrored((current) => !current);
    },
    swap: () => {
      setStageFirst((current) => !current);
    },
    setStepsOpen,
    setSpeedOpen,
  };
};
