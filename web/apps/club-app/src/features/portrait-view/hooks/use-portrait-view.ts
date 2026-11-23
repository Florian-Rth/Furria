import type { KkAvatarOpen } from '@furria/ui/KkAvatar';
import { useState } from 'react';

export interface PortraitView {
  shown: boolean;
  open: KkAvatarOpen;
  close: () => void;
}

export const usePortraitView = (label: string): PortraitView => {
  const [shown, setShown] = useState(false);
  const show = (): void => {
    setShown(true);
  };
  const close = (): void => {
    setShown(false);
  };

  return { shown, open: { label, onOpen: show }, close };
};
