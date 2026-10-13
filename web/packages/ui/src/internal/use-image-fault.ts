import { useState } from 'react';

export interface ImageFault {
  hasFailed: boolean;
  onError: () => void;
}

export const useImageFault = (source: string): ImageFault => {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return {
    hasFailed: failedSource === source,
    onError: () => {
      setFailedSource(source);
    },
  };
};
