import type { FC, PropsWithChildren } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';

export const KkStudioDSheetGroup: FC<PropsWithChildren> = ({ children }) => (
  <KkEyebrow tone="muted" sx={{ flexShrink: 0, px: 1.5, pt: 2, pb: 0.5 }}>
    {children}
  </KkEyebrow>
);
