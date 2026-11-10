import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { PROMO_GUTTER } from '../promo-paint';

const COPY_TOP = 150;
const COPY_WIDTH = 660;

interface KkPromoStageCopyProps extends PropsWithChildren {
  left?: number;
  top?: number;
  width?: number;
}

export const KkPromoStageCopy: FC<KkPromoStageCopyProps> = ({
  left = PROMO_GUTTER,
  top = COPY_TOP,
  width = COPY_WIDTH,
  children,
}) => (
  <Stack data-kk-promo-copy sx={{ position: 'absolute', left, top, width, gap: 3.5, zIndex: 2 }}>
    {children}
  </Stack>
);
