import { useEffect, useRef, useState } from 'react';

const COPIED_LABEL_MS = 2000;

export interface CopyLinkState {
  copied: boolean;
  copyLink: () => Promise<void>;
}

export const useCopyLink = (): CopyLinkState => {
  const [copied, setCopied] = useState(false);
  const resetTimeout = useRef<number | undefined>(undefined);

  useEffect(
    () => (): void => {
      window.clearTimeout(resetTimeout.current);
    },
    [],
  );

  const copyLink = async (): Promise<void> => {
    window.clearTimeout(resetTimeout.current);
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      setCopied(false);
      return;
    }
    setCopied(true);
    resetTimeout.current = window.setTimeout(() => setCopied(false), COPIED_LABEL_MS);
  };

  return { copied, copyLink };
};
