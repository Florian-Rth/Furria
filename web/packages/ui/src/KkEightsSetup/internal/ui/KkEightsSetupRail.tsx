import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkEightsSegmentState } from '../../../KkEightsBar/internal/ui/KkEightsBarProgress';
import { KkEightsGlyph } from '../../../KkEightsGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkEightsSetupSegment {
  key: string;
  text: string;
  stateText: string;
  state: KkEightsSegmentState;
  next: boolean;
}

interface KkEightsSetupRailProps {
  label: string;
  segments: readonly KkEightsSetupSegment[];
}

export const KkEightsSetupRail: FC<KkEightsSetupRailProps> = ({ label, segments }) => {
  const items = segments.map((segment, index) => (
    <Stack
      key={segment.key}
      component="li"
      aria-label={`${index + 1}. ${segment.text}: ${segment.stateText}`}
      aria-current={segment.next ? 'step' : undefined}
      data-state={segment.state}
      data-next={segment.next}
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        gap: 0.5,
        color: palette(theme).text.secondary,
        '&[data-state="done"]': { color: palette(theme).text.primary },
        '&[data-next="true"]': { color: palette(theme).text.primary },
      })}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          height: '0.375rem',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 12%, transparent)`,
          '[data-state="done"] > &': { backgroundColor: palette(theme).text.primary },
          '[data-state="waiting"] > &': { backgroundColor: palette(theme).warning.main },
          '[data-next="true"] > &': { backgroundColor: palette(theme).primary.main },
        })}
      />
      <Stack direction="row" aria-hidden sx={{ alignItems: 'center', gap: 0.25, minWidth: 0 }}>
        <KkEightsGlyph name={segment.state} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '@media (max-width: 40rem)': { display: 'none' },
          }}
        >
          {segment.text}
        </Typography>
      </Stack>
    </Stack>
  ));

  return (
    <Stack
      component="ol"
      direction="row"
      aria-label={label}
      sx={{ gap: 0.5, m: 0, p: 0, listStyle: 'none', minWidth: 0 }}
    >
      {items}
    </Stack>
  );
};
