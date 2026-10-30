import { useState } from 'react';
import type { StudioGMode } from './use-studio-g-page';

export const useStudioGReturn = (mode: StudioGMode): boolean => {
  const [edited, setEdited] = useState(false);

  if (mode === 'edit' && !edited) {
    setEdited(true);
  }

  return edited;
};
