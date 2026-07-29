import { useState } from 'react';

export const useShownPhotoIndex = (index: number | null): number | null => {
  const [shown, setShown] = useState(index);
  const [previous, setPrevious] = useState(index);

  if (index !== previous) {
    setPrevious(index);
    if (index !== null) {
      setShown(index);
    }
  }

  return shown;
};
