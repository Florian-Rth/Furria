import { useContext } from 'react';
import type { PreviewAccessValue } from '../preview-access-context';
import { PreviewAccessContext } from '../preview-access-context';

export const usePreviewAccess = (): PreviewAccessValue => {
  const value = useContext(PreviewAccessContext);

  if (value === null) {
    throw new Error('usePreviewAccess must be used inside a PreviewAccessProvider.');
  }

  return value;
};
