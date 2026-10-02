import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { skeletonSurface } from '../internal/skeleton-shimmer';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import {
  DENSE_GAP,
  DENSE_HEAD_LINE_BOX,
  DENSE_INSET,
  densePanelFrame,
  densePanelMaterials,
  denseRowFrame,
  denseSpineFrame,
  factRulePaint,
} from './internal/dense-panel-paint';

interface SkeletonBar {
  width: string;
  height: string;
}

const BAR_RADIUS = `${kkTokens.radius.pill}px`;
const TITLE_BAR_HEIGHT = '0.875rem';
const TITLE_BAR_WIDTHS = ['46%', '58%', '38%'];

const barPaintOf = (size: SkeletonBar): CSSObject => ({
  ...size,
  flexShrink: 0,
  borderRadius: BAR_RADIUS,
});

const LABEL_BAR = barPaintOf({ width: '4.5rem', height: '0.75rem' });
const EYEBROW_BAR = barPaintOf({ width: '1.75rem', height: '0.625rem' });
const TIME_BAR = barPaintOf({ width: '2.5rem', height: '0.875rem' });
const META_BAR = barPaintOf({ width: '24%', height: '0.75rem' });

const HEAD_FRAME: CSSObject = {
  minHeight: DENSE_HEAD_LINE_BOX,
  justifyContent: 'center',
  px: DENSE_INSET,
};

const SPINE_FRAME: CSSObject = { ...denseSpineFrame, gap: 0.5 };

const FACT_FRAME: CSSObject = {
  flex: '1 1 0',
  alignItems: 'center',
  gap: DENSE_GAP,
  minWidth: 0,
};

const linePaint = (theme: Theme): CSSObject => ({
  ...denseRowFrame,
  '&:not(:first-of-type)': factRulePaint(theme),
});

interface KkDensePanelSkeletonProps {
  sx?: KkSx;
}

export const KkDensePanelSkeleton: FC<KkDensePanelSkeletonProps> = ({ sx }) => {
  const lines = TITLE_BAR_WIDTHS.map((width) => {
    const titleBar = barPaintOf({ width, height: TITLE_BAR_HEIGHT });

    return (
      <Stack key={width} direction="row" sx={linePaint}>
        <Stack sx={SPINE_FRAME}>
          <Box sx={[skeletonSurface, EYEBROW_BAR]} />
          <Box sx={[skeletonSurface, TIME_BAR]} />
        </Stack>
        <Stack direction="row" sx={FACT_FRAME}>
          <Box sx={[skeletonSurface, titleBar]} />
          <Box sx={[skeletonSurface, META_BAR]} />
        </Stack>
      </Stack>
    );
  });

  return (
    <Stack
      aria-hidden
      data-kk-dense-panel-skeleton
      sx={[densePanelFrame, densePanelMaterials.own, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack sx={HEAD_FRAME}>
        <Box sx={[skeletonSurface, LABEL_BAR]} />
      </Stack>
      <Stack>{lines}</Stack>
    </Stack>
  );
};
