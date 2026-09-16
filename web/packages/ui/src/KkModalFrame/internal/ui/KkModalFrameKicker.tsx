import type { FC, PropsWithChildren } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';

export const KkModalFrameKicker: FC<PropsWithChildren> = ({ children }) => (
  <KkEyebrow tone="accent">{children}</KkEyebrow>
);
