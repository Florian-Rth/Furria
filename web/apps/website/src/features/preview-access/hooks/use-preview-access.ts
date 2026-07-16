import { useContext } from 'react';
import { PreviewAccessContext } from '../preview-access-context';
import type { PreviewAccessValue } from '../types';

export const usePreviewAccess = (): PreviewAccessValue => {
  const value = useContext(PreviewAccessContext);

  if (value === null) {
    throw new Error('usePreviewAccess must be used inside a PreviewAccessProvider.');
  }

  return value;
};
