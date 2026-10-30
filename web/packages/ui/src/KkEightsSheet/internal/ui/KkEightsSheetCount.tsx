import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkEightsSheetEdgeHandle } from './KkEightsSheetEdge';
import { KkEightsSheetEdge } from './KkEightsSheetEdge';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const PERCENT = 100;
const MIN_BAR = 4;

export type KkEightsSheetCountTone = 'plain' | 'shaded' | 'current';
export type KkEightsSheetKey = 'none' | 'other' | 'selected';

interface KkEightsSheetCountProps {
  column: number;
  count: number;
  seconds: number;
  label: string;
  numbered: boolean;
  wave: readonly number[];
  tone: KkEightsSheetCountTone;
  keyed: KkEightsSheetKey;
  partEdge: boolean;
  edge: KkEightsSheetEdgeHandle | null;
  onSeek: (seconds: number) => void;
}

export const KkEightsSheetCount: FC<KkEightsSheetCountProps> = ({
  column,
  count,
  seconds,
  label,
  numbered,
  wave,
  tone,
  keyed,
  partEdge,
  edge,
  onSeek,
}) => {
  const seek = (): void => {
    onSeek(seconds);
  };
  const place = { gridColumn: String(column + 1) };
  const bars = wave.map((value, index) => (
    <Box
      key={String(index)}
      style={{ height: `${Math.max(MIN_BAR, value * PERCENT)}%` }}
      sx={{ flex: 1, minWidth: 0, borderRadius: '1px', backgroundColor: 'currentColor' }}
    />
  ));
  const number = numbered ? (
    <Typography
      component="span"
      variant="caption"
      sx={{
        position: 'absolute',
        top: '0.125rem',
        left: '0.3125rem',
        lineHeight: 1,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        color: 'inherit',
      }}
    >
      {count}
    </Typography>
  ) : null;
  const handle = edge === null ? null : <KkEightsSheetEdge {...edge} />;

  return (
    <Box
      role="button"
      tabIndex={-1}
      aria-label={label}
      data-kk-eights-count
      data-seconds={seconds}
      data-downbeat={count === 1}
      data-tone={tone}
      data-keyed={keyed}
      data-part-edge={partEdge}
      onClick={seek}
      style={place}
      sx={(theme) => ({
        position: 'relative',
        gridRow: 1,
        minWidth: 0,
        height: '100%',
        cursor: 'pointer',
        color: palette(theme).text.secondary,
        boxShadow: `inset ${kkTokens.line.hair}px 0 0 ${palette(theme).divider}`,
        '&[data-downbeat="true"]': {
          color: palette(theme).text.primary,
          boxShadow: `inset ${kkTokens.line.section}px 0 0 color-mix(in srgb, ${palette(theme).text.primary} 45%, transparent)`,
        },
        '&[data-tone="shaded"]': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 5%, transparent)`,
        },
        '&[data-tone="current"]': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 9%, transparent)`,
        },
        '&[data-part-edge="true"]': {
          boxShadow: `inset ${kkTokens.line.page * 2}px 0 0 ${palette(theme).text.primary}`,
        },
        '&:hover': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 10%, transparent)`,
        },
        '& [data-kk-eights-wave]': {
          color: `color-mix(in srgb, ${palette(theme).text.primary} 20%, transparent)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '0.25rem',
          right: '0.25rem',
          width: '0.4375rem',
          height: '0.4375rem',
          transform: 'rotate(45deg)',
          border: `${kkTokens.line.hair}px solid transparent`,
        },
        '&[data-keyed="other"]::after': { borderColor: palette(theme).text.secondary },
        '&[data-keyed="selected"]::after': {
          borderColor: palette(theme).primary.main,
          backgroundColor: palette(theme).primary.main,
        },
      })}
    >
      <Stack
        direction="row"
        aria-hidden
        data-kk-eights-wave
        sx={{
          position: 'absolute',
          left: '0.25rem',
          right: '0.25rem',
          bottom: '0.1875rem',
          height: '58%',
          alignItems: 'center',
          gap: '1px',
          pointerEvents: 'none',
        }}
      >
        {bars}
      </Stack>
      {number}
      {handle}
    </Box>
  );
};
