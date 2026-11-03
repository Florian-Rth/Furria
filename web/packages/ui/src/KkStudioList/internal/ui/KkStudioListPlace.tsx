import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioListPlaceProps extends PropsWithChildren {
  placeRef: (element: Element | null) => void;
  label: string;
  over: boolean;
  wide: boolean;
}

export const KkStudioListPlace: FC<KkStudioListPlaceProps> = ({
  placeRef,
  label,
  over,
  wide,
  children,
}) => (
  <Stack
    ref={placeRef}
    data-over={over}
    data-wide={wide}
    sx={(theme) => ({
      flexShrink: 0,
      minHeight: '3.25rem',
      gap: 0.375,
      p: 0.625,
      borderRadius: `${kkTokens.radius.base - 4}px`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      '&[data-wide="true"]': { gridColumn: '1 / -1' },
      transition: 'box-shadow 120ms ease-out, background-color 120ms ease-out',
      '&[data-over="true"]': {
        backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 8%, transparent)`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.page}px ${palette(theme).primary.main}`,
      },
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 900,
        lineHeight: 1.2,
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {label}
    </Typography>
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {children}
    </Stack>
  </Stack>
);
