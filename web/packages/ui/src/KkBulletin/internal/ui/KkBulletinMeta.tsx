import type { FC, PropsWithChildren } from 'react';
import { KkMeta } from '../../../KkMeta';
import type { KkSx } from '../../../kk-sx';

interface KkBulletinMetaProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkBulletinMeta: FC<KkBulletinMetaProps> = ({ sx, children }) => (
  <KkMeta component="span" tone="faint" lines={1} sx={sx}>
    {children}
  </KkMeta>
);
