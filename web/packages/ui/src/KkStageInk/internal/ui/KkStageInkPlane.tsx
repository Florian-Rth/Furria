import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';
import type { KkStageInkDensity, KkStageInkFrontEdge } from '../../stage-ink-density';

const VEIL = '16%';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const surfaces: Record<KkStageInkDensity, (theme: Theme) => CSSObject> = {
  full: (theme) => ({
    borderRadius: `${kkTokens.radius.base}px`,
    backgroundColor: palette(theme).background.paper,
    boxShadow: kkTokens.shadow.raised,
  }),
  card: (theme) => ({
    borderRadius: `${kkTokens.radius.base / 2}px`,
    backgroundColor: inkWash(theme, '4%'),
    border: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
  }),
  thumb: (theme) => ({
    borderRadius: `${kkTokens.radius.base / 4}px`,
    backgroundColor: inkWash(theme, '7%'),
    border: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
  }),
};

interface KkStageInkPlaneProps {
  density: KkStageInkDensity;
  front: KkStageInkFrontEdge;
  artworkSvg: string | null;
  centre: boolean;
}

export const KkStageInkPlane: FC<KkStageInkPlaneProps> = ({
  density,
  front,
  artworkSvg,
  centre,
}) => {
  const source = density === 'full' ? stretchedSvgSourceOf(artworkSvg) : null;
  const turned = front === 'top' ? 'rotate(180deg)' : 'none';
  const artwork =
    source === null ? null : (
      <KkPhoto
        alt=""
        image={{ src: source }}
        fit="fill"
        fill
        priority
        sx={{ position: 'absolute', inset: 0, transform: turned, pointerEvents: 'none' }}
      />
    );
  const veil =
    source === null ? null : (
      <Box
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.default} ${VEIL}, transparent)`,
        })}
      />
    );
  const centreLine = centre ? (
    <Box
      data-kk-stage-centre
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        borderLeft: `${kkTokens.line.hair}px dashed ${palette(theme).divider}`,
      })}
    />
  ) : null;
  const edgeWidth = density === 'full' ? kkTokens.line.page : kkTokens.line.section;

  return (
    <Box
      aria-hidden
      data-kk-stage-plane={density}
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        boxSizing: 'border-box',
        overflow: 'clip',
        ...surfaces[density](theme),
        '& > *': { borderRadius: 0 },
      })}
    >
      {artwork}
      {veil}
      {centreLine}
      <Box
        data-kk-stage-front={front}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          [front]: 0,
          height: edgeWidth,
          backgroundColor: palette(theme).text.primary,
        })}
      />
    </Box>
  );
};
