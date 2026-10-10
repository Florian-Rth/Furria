import { useEffect, useState } from 'react';

const REMOVAL_ARMED_MS = 4_000;

export interface BannerToolbar {
  replaceRef: (node: HTMLElement | null) => void;
  replaceAnchor: HTMLElement | null;
  isReplaceOpen: boolean;
  isRemovalArmed: boolean;
  openReplace: () => void;
  closeReplace: () => void;
  armRemoval: () => void;
  disarmRemoval: () => void;
}

export const useBannerToolbar = (): BannerToolbar => {
  const [replaceAnchor, setReplaceAnchor] = useState<HTMLElement | null>(null);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [isRemovalArmed, setIsRemovalArmed] = useState(false);

  useEffect(() => {
    if (!isRemovalArmed) {
      return;
    }
    const timer = window.setTimeout(() => {
      setIsRemovalArmed(false);
    }, REMOVAL_ARMED_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isRemovalArmed]);

  return {
    replaceRef: setReplaceAnchor,
    replaceAnchor,
    isReplaceOpen,
    isRemovalArmed,
    openReplace: () => {
      setIsRemovalArmed(false);
      setIsReplaceOpen(true);
    },
    closeReplace: () => {
      setIsReplaceOpen(false);
    },
    armRemoval: () => {
      setIsRemovalArmed(true);
    },
    disarmRemoval: () => {
      setIsRemovalArmed(false);
    },
  };
};
