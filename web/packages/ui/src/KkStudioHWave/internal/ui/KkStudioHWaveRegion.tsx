import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHWaveRegionProps {
  start: number;
  end: number;
  number: number;
  name: string;
  meta: string;
  selected: boolean;
}

export const KkStudioHWaveRegion: FC<KkStudioHWaveRegionProps> = ({
  start,
  end,
  number,
  name,
  meta,
  selected,
}) => {
  const place = { left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` };

  return (
    <Box
      data-kk-studio-h-song={number}
      data-selected={selected}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        pointerEvents: 'none',
        borderLeft: `${kkTokens.line.section}px solid ${palette(theme).text.primary}`,
        backgroundColor: 'transparent',
        transition: 'background-color 200ms ease-out',
        '&[data-selected="true"]': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
        },
      })}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', gap: 0.75, pl: 0.75, pt: 0.5, minWidth: 0 }}
      >
        <Box
          sx={(theme) => ({
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            width: '1.375rem',
            height: '1.375rem',
            borderRadius: `${kkTokens.radius.bar}px`,
            color: selected ? palette(theme).background.paper : palette(theme).text.primary,
            backgroundColor: selected ? palette(theme).text.primary : 'transparent',
            boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).text.primary}`,
          })}
        >
          <Typography
            component="span"
            variant="h4"
            sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
          >
            {number}
          </Typography>
        </Box>
        <Stack sx={{ minWidth: 0 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Typography>
          <Typography
            component="span"
            variant="caption"
            sx={{
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'text.secondary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {meta}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
