import { useState } from 'react';

export interface StudioLargeText {
  on: boolean;
  videoShown: boolean;
  toggleVideo: () => void;
}

export const useStudioLargeText = (on: boolean): StudioLargeText => {
  const [videoShown, setVideoShown] = useState(false);

  return {
    on,
    videoShown,
    toggleVideo: () => {
      setVideoShown((shown) => !shown);
    },
  };
};
