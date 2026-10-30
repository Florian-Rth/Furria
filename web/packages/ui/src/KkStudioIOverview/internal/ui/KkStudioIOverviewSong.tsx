import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIOverviewSongProps {
  number: number;
  name: string;
  meta: string;
  cut: string;
  from: number;
  to: number;
}

export const KkStudioIOverviewSong: FC<KkStudioIOverviewSongProps> = ({
  number,
  name,
  meta,
  cut,
  from,
  to,
}) => (
  <Stack
    direction="row"
    data-kk-studio-i-song
    sx={(theme) => ({
      alignItems: 'center',
      gap: 1.25,
      py: 0.75,
      borderBottom: `1px solid ${palette(theme).divider}`,
      '&:last-of-type': { borderBottom: 'none' },
    })}
  >
    <Typography
      variant="h4"
      component="span"
      sx={{ width: '1.5rem', textAlign: 'center', flexShrink: 0, color: 'text.secondary' }}
    >
      {number}
    </Typography>
    <Stack sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            ml: 'auto',
            flexShrink: 0,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {cut}
        </Typography>
      </Stack>
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'relative',
          height: '0.375rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: `color-mix(in srgb, ${palette(theme).warning.main} 28%, transparent)`,
        })}
      >
        <Box
          style={{ left: `${from * PERCENT}%`, width: `${(to - from) * PERCENT}%` }}
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            bottom: 0,
            borderRadius: 'inherit',
            backgroundColor: palette(theme).text.primary,
          })}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}
      >
        {meta}
      </Typography>
    </Stack>
  </Stack>
);
