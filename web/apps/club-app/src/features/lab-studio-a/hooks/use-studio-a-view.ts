import { useState } from 'react';

export interface StudioAView {
  mirrored: boolean;
  toggleMirror: () => void;
}

export const useStudioAView = (): StudioAView => {
  const [mirrored, setMirrored] = useState(true);

  return {
    mirrored,
    toggleMirror: () => {
      setMirrored((current) => !current);
    },
  };
};
