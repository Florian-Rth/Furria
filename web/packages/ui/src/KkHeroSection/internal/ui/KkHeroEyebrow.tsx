import type { FC, PropsWithChildren } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';

export const KkHeroEyebrow: FC<PropsWithChildren> = ({ children }) => (
  <KkEyebrow>{children}</KkEyebrow>
);
