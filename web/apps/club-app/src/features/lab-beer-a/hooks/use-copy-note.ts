import { useEffect, useState } from 'react';

const COPIED_MS = 2000;

export interface BeerACopyNote {
  copied: boolean;
  copy: () => void;
}

export const useCopyNote = (note: string | null): BeerACopyNote => {
  const [copiedAt, setCopiedAt] = useState<number | null>(null);

  useEffect(() => {
    if (copiedAt === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopiedAt(null);
    }, COPIED_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copiedAt]);

  const copy = (): void => {
    if (note === null) {
      return;
    }

    void navigator.clipboard.writeText(note).then(() => {
      setCopiedAt(Date.now());
    });
  };

  return { copied: copiedAt !== null, copy };
};
