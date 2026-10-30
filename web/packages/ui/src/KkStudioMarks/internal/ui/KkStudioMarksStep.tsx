import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;
const GAP = '1.5px';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioMarksStepProps {
  start: number;
  end: number;
  number: number;
  label: string;
  current: boolean;
  onPress: () => void;
}

export const KkStudioMarksStep: FC<KkStudioMarksStepProps> = ({
  start,
  end,
  number,
  label,
  current,
  onPress,
}) => {
  const place = {
    left: `calc(${start * PERCENT}% + ${GAP})`,
    width: `calc(${(end - start) * PERCENT}% - 2 * ${GAP})`,
  };

  return (
    <ButtonBase
      aria-label={label}
      aria-current={current ? 'step' : undefined}
      onClick={onPress}
      data-kk-studio-mark
      data-current={current}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: '1.5rem',
        bottom: 0,
        minWidth: 0,
        borderRadius: `${kkTokens.radius.bar + 1}px`,
        color: palette(theme).text.secondary,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 9%, transparent)`,
        transition: 'background-color 200ms ease-out, box-shadow 200ms ease-out',
        '&[data-current="true"]': {
          ...redInk(theme),
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
        },
        ...focusRing(theme),
      })}
    >
      <Typography
        component="span"
        variant="h4"
        sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
      >
        {number}
      </Typography>
    </ButtonBase>
  );
};
