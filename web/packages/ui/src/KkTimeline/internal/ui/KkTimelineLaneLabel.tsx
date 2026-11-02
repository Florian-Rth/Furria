import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkTimelineLaneLabelProps {
  text: string;
  aside: string | null;
}

export const KkTimelineLaneLabel: FC<KkTimelineLaneLabelProps> = ({ text, aside }) => {
  const note =
    aside === null ? null : (
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}
      >
        {aside}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        top: '0.125rem',
        left: '0.25rem',
        zIndex: 4,
        gap: 0.5,
        alignItems: 'baseline',
        px: 0.5,
        borderRadius: `${kkTokens.radius.bar}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 86%, transparent)`,
        pointerEvents: 'none',
      })}
    >
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{
          fontWeight: 900,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          lineHeight: 1.1,
          color: 'text.secondary',
        }}
      >
        {text}
      </Typography>
      {note}
    </Stack>
  );
};
