import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { PERCENT } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesStepProps {
  start: number;
  end: number;
  number: number;
  name: string;
  label: string;
  current: boolean;
  onPress: () => void;
}

export const KkFocusLanesStep: FC<KkFocusLanesStepProps> = ({
  start,
  end,
  number,
  name,
  label,
  current,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-current={current ? 'step' : undefined}
    onClick={onPress}
    data-current={current}
    style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      top: '1.125rem',
      bottom: '0.25rem',
      justifyContent: 'flex-start',
      gap: 0.5,
      px: 0.75,
      minWidth: 0,
      borderRadius: `${kkTokens.radius.bar * 2}px`,
      color: palette(theme).text.primary,
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, ${palette(theme).background.paper})`,
      boxShadow: `inset ${kkTokens.line.hair}px 0 0 ${palette(theme).background.paper}`,
      '&[data-current="true"]': {
        backgroundColor: palette(theme).text.primary,
        color: palette(theme).background.paper,
      },
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={(theme) => ({
        fontWeight: 900,
        fontVariantNumeric: 'tabular-nums',
        color: palette(theme).primary.main,
        '[data-current="true"] > &': { color: 'inherit' },
      })}
    >
      {number}
    </Typography>
    <Typography
      component="span"
      variant="caption"
      sx={{
        minWidth: 0,
        fontWeight: 700,
        color: 'inherit',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </Typography>
  </ButtonBase>
);
