import { useState } from 'react';

export interface CopyText {
  copied: boolean;
  copy: () => void;
}

export const useCopyText = (text: string | null): CopyText => {
  const [copied, setCopied] = useState(false);

  const copy = (): void => {
    if (text === null) {
      return;
    }

    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
    });
  };

  return { copied, copy };
};
