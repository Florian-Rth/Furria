import type { FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { usePageHeaderContainer } from '../page-header-context';

export const AppPageHeader: FC<PropsWithChildren> = ({ children }) => {
  const container = usePageHeaderContainer();

  if (container === null) {
    return null;
  }

  return createPortal(children, container);
};
