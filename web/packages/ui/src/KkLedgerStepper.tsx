import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { KkIcon } from './KkIcon';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkLedgerStepperSize = 'compact' | 'large';

const BUTTON_EXTENT: Record<KkLedgerStepperSize, string> = {
  compact: kkTokens.tapTarget,
  large: '3.5rem',
};

const FIGURE_VARIANT: Record<KkLedgerStepperSize, string> = {
  compact: 'h2',
  large: 'poster',
};

const FIGURE_WIDTH: Record<KkLedgerStepperSize, string> = {
  compact: '1.75rem',
  large: '4.5rem',
};

const stepPaint =
  (size: KkLedgerStepperSize) =>
  (theme: Theme): CSSObject => ({
    width: BUTTON_EXTENT[size],
    height: BUTTON_EXTENT[size],
    flexShrink: 0,
    borderRadius: '50%',
    borderWidth: kkTokens.line.section,
    borderStyle: 'solid',
    borderColor: (theme.vars ?? theme).palette.text.primary,
    color: (theme.vars ?? theme).palette.text.primary,
    transition: 'transform 120ms ease-out, opacity 160ms ease-out',
    '&:active': { transform: 'scale(0.92)' },
    '&.Mui-disabled': { opacity: 0.28 },
    ...focusRing(theme),
  });

interface KkLedgerStepperProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  lessLabel: string;
  moreLabel: string;
  size?: KkLedgerStepperSize;
  onChange: (value: number) => void;
  sx?: KkSx;
}

export const KkLedgerStepper: FC<KkLedgerStepperProps> = ({
  value,
  min,
  max,
  unit,
  lessLabel,
  moreLabel,
  size = 'compact',
  onChange,
  sx,
}) => {
  const less = (): void => {
    onChange(Math.max(min, value - 1));
  };
  const more = (): void => {
    onChange(Math.min(max, value + 1));
  };
  const iconSize = size === 'large' ? 'medium' : 'small';
  const unitLine =
    size === 'large' ? (
      <Box component="span" sx={{ ...stepLabel, textAlign: 'center' }}>
        {unit}
      </Box>
    ) : null;

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={`${value} ${unit}`}
      data-kk-ledger-stepper={size}
      sx={[
        { alignItems: 'center', gap: size === 'large' ? 2.5 : 1, flexShrink: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <ButtonBase
        aria-label={lessLabel}
        disabled={value <= min}
        onClick={less}
        sx={stepPaint(size)}
      >
        <KkIcon name="subtract" size={iconSize} />
      </ButtonBase>
      <Stack sx={{ alignItems: 'center', minWidth: FIGURE_WIDTH[size] }}>
        <Box
          component="output"
          aria-live="polite"
          sx={{
            ...stepFigures,
            typography: FIGURE_VARIANT[size],
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {value}
        </Box>
        {unitLine}
      </Stack>
      <ButtonBase
        aria-label={moreLabel}
        disabled={value >= max}
        onClick={more}
        sx={stepPaint(size)}
      >
        <KkIcon name="add" size={iconSize} />
      </ButtonBase>
    </Stack>
  );
};
