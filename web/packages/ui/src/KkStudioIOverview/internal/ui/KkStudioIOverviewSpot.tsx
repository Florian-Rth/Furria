import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIOverviewSpotProps {
  number: number;
  name: string;
  open: boolean;
}

export const KkStudioIOverviewSpot: FC<KkStudioIOverviewSpotProps> = ({ number, name, open }) => (
  <Stack
    component="li"
    direction="row"
    data-kk-studio-i-spot
    data-open={open}
    sx={(theme) => ({
      alignItems: 'center',
      gap: 0.75,
      minWidth: 0,
      px: 0.75,
      py: 0.5,
      borderRadius: `${kkTokens.radius.pill}px`,
      border: open
        ? `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`
        : `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={(theme) => ({
        width: '1.375rem',
        height: '1.375rem',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        fontWeight: 900,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        backgroundColor: palette(theme).action.selected,
        ...(open ? goldInkOf(theme) : {}),
      })}
    >
      {number}
    </Typography>
    <Typography
      component="span"
      variant="caption"
      sx={(theme) => ({
        fontWeight: 700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...(open ? goldInkOf(theme) : {}),
      })}
    >
      {name}
    </Typography>
  </Stack>
);
