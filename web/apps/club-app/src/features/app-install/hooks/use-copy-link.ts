import { useState } from 'react';

export interface CopyLink {
  isCopied: boolean;
  copy: () => void;
}

export const useCopyLink = (): CopyLink => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = (): void => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
    });
  };

  return { isCopied, copy };
};
