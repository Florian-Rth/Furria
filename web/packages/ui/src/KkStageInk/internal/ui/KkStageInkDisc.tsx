import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';
import type { KkStageInkDensity, KkStageInkDiscKind } from '../../stage-ink-density';
import { NARROW_FIELD } from '../../stage-ink-density';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface DiscSize {
  xs: string;
  desktop: string;
  narrow: string;
}

const fullSize: DiscSize = { xs: '1.25rem', desktop: '1.625rem', narrow: '0.75rem' };

const smallSizes: Record<Exclude<KkStageInkDensity, 'full'>, string> = {
  card: '5.5cqw',
  thumb: '8cqw',
};

interface DiscPaint {
  kind: KkStageInkDiscKind;
  muted: boolean;
  moving: boolean;
  density: KkStageInkDensity;
}

const paintOf = (theme: Theme, { kind, muted, moving, density }: DiscPaint): CSSObject => {
  if (kind === 'own') {
    const gap = palette(theme).background.paper;
    const ring = palette(theme).primary.main;
    return {
      backgroundColor: ring,
      color: palette(theme).primary.contrastText,
      boxShadow:
        density === 'thumb'
          ? 'none'
          : `0 0 0 ${kkTokens.line.hair}px ${gap}, 0 0 0 ${kkTokens.line.hair + kkTokens.line.section}px ${ring}`,
    };
  }

  if (kind === 'absent') {
    return {
      ...goldInkOf(theme),
      backgroundColor: `color-mix(in srgb, ${palette(theme).warning.main} 18%, transparent)`,
      border: `${kkTokens.line.section}px dashed ${palette(theme).warning.main}`,
    };
  }

  if (kind === 'open') {
    return density === 'thumb'
      ? { backgroundColor: palette(theme).text.disabled }
      : {
          color: palette(theme).text.secondary,
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 35%, transparent)`,
          border: `${kkTokens.line.hair}px dashed ${palette(theme).text.secondary}`,
        };
  }

  if (moving) {
    return {
      backgroundColor: palette(theme).primary.main,
      color: palette(theme).primary.contrastText,
      transition: 'background-color 160ms ease-out, color 160ms ease-out',
    };
  }

  return muted
    ? {
        backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 90%, transparent)`,
        color: palette(theme).text.secondary,
        boxShadow: kkTokens.shadow.rest,
      }
    : {
        backgroundColor: palette(theme).text.primary,
        color: palette(theme).background.default,
        transition: 'background-color 160ms ease-out, color 160ms ease-out',
      };
};

const sizeOf = (theme: Theme, density: KkStageInkDensity): CSSObject => {
  if (density === 'full') {
    return {
      width: fullSize.xs,
      height: fullSize.xs,
      [theme.breakpoints.up('desktop')]: { width: fullSize.desktop, height: fullSize.desktop },
      [NARROW_FIELD]: {
        width: fullSize.narrow,
        height: fullSize.narrow,
        '& [data-kk-stage-number]': { display: 'none' },
      },
    };
  }

  const size = smallSizes[density];
  return { width: size, height: size };
};

interface KkStageInkDiscProps {
  kind: KkStageInkDiscKind;
  density: KkStageInkDensity;
  number: number;
  muted?: boolean;
  moving?: boolean;
  turn?: number | null;
  selected?: boolean;
  lifted?: boolean;
  dimmed?: boolean;
}

export const KkStageInkDisc: FC<KkStageInkDiscProps> = ({
  kind,
  density,
  number,
  muted = false,
  moving = false,
  turn = null,
  selected = false,
  lifted = false,
  dimmed = false,
}) => {
  const full = density === 'full';
  const paint: DiscPaint = { kind, muted, moving, density };
  const notch =
    turn === null || !full ? null : (
      <Box
        aria-hidden
        style={{ transform: `rotate(${turn}deg)` }}
        sx={{ position: 'absolute', inset: 0 }}
      >
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: 0,
            height: 0,
            transform: 'translate(-50%, 0.25rem)',
            borderLeft: '0.3125rem solid transparent',
            borderRight: '0.3125rem solid transparent',
            borderTop: `0.4375rem solid ${palette(theme).primary.main}`,
          })}
        />
      </Box>
    );
  const figure = full ? (
    <Typography
      component="span"
      data-kk-stage-number
      variant="caption"
      sx={{
        position: 'relative',
        lineHeight: 1,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        color: 'inherit',
      }}
    >
      {number}
    </Typography>
  ) : null;

  return (
    <Box
      data-kk-stage-disc={kind}
      data-selected={selected}
      data-lifted={lifted}
      data-dimmed={dimmed}
      sx={(theme) => ({
        position: 'relative',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        ...sizeOf(theme, density),
        ...paintOf(theme, paint),
        outline: `${kkTokens.line.section}px solid transparent`,
        outlineOffset: kkTokens.line.section,
        transition:
          'background-color 160ms ease-out, color 160ms ease-out, outline-color 160ms ease-out, transform 160ms ease-out, opacity 160ms ease-out',
        '&[data-selected="true"]': {
          outlineColor: palette(theme).primary.main,
          transform: 'scale(1.12)',
        },
        '&[data-lifted="true"]': {
          transform: 'scale(1.3)',
          boxShadow: kkTokens.shadow.floating,
        },
        '&[data-dimmed="true"]': { opacity: 0.45 },
      })}
    >
      {notch}
      {figure}
    </Box>
  );
};
