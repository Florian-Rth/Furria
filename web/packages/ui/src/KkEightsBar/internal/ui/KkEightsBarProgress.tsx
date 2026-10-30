import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkEightsSegmentState = 'done' | 'open' | 'waiting' | 'locked';

interface KkEightsBarProgressProps {
  text: string;
  label: string;
  segments: readonly KkEightsSegmentState[];
  onPress: () => void;
}

export const KkEightsBarProgress: FC<KkEightsBarProgressProps> = ({
  text,
  label,
  segments,
  onPress,
}) => {
  const marks = segments.map((state, index) => (
    <Box
      key={String(index)}
      data-state={state}
      sx={(theme) => ({
        width: '0.5rem',
        height: '1rem',
        borderRadius: `${kkTokens.radius.bar}px`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).text.disabled}`,
        '&[data-state="done"]': {
          backgroundColor: palette(theme).text.primary,
          boxShadow: 'none',
        },
        '&[data-state="waiting"]': {
          backgroundColor: palette(theme).warning.main,
          boxShadow: 'none',
        },
        '&[data-state="locked"]': { opacity: kkTokens.opacity.dimmed },
      })}
    />
  ));

  return (
    <ButtonBase
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onPress}
      sx={(theme) => ({
        flexShrink: 0,
        gap: 0.75,
        minHeight: kkTokens.tapTarget,
        px: 1,
        borderRadius: `${kkTokens.radius.chip}px`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
        color: palette(theme).text.primary,
        ...focusRing(theme),
      })}
    >
      <Stack direction="row" aria-hidden sx={{ gap: 0.25 }}>
        {marks}
      </Stack>
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
      >
        {text}
      </Typography>
    </ButtonBase>
  );
};
