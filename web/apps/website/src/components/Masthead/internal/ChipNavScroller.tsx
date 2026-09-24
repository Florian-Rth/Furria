import { KkChipScroller } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';

export const ChipNavScroller: FC<PropsWithChildren> = ({ children }) => (
  <KkChipScroller sx={{ gap: 1, px: 2, pt: 0.5, pb: 1.5 }}>{children}</KkChipScroller>
);
