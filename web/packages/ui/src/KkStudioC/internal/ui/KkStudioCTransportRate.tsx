import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';

const STEP = '2rem';
const VALUE_WIDTH = '2.75rem';

const stepPaint = (theme: Theme): CSSObject => ({
  width: STEP,
  height: STEP,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: (theme.vars ?? theme).palette.text.primary,
  '&.Mui-disabled': { color: (theme.vars ?? theme).palette.text.disabled },
  ...focusRing(theme),
});

interface KkStudioCTransportRateProps {
  value: string;
  caption: string;
  slowed: boolean;
  slowerLabel: string;
  fasterLabel: string;
  canSlower: boolean;
  canFaster: boolean;
  onSlower: () => void;
  onFaster: () => void;
}

export const KkStudioCTransportRate: FC<KkStudioCTransportRateProps> = ({
  value,
  caption,
  slowed,
  slowerLabel,
  fasterLabel,
  canSlower,
  canFaster,
  onSlower,
  onFaster,
}) => (
  <Stack
    direction="row"
    role="group"
    aria-label={caption}
    data-kk-studio-c-rate
    sx={(theme) => ({
      alignItems: 'center',
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.pill}px`,
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: (theme.vars ?? theme).palette.divider,
    })}
  >
    <ButtonBase aria-label={slowerLabel} disabled={!canSlower} onClick={onSlower} sx={stepPaint}>
      <RemoveRoundedIcon fontSize="small" />
    </ButtonBase>
    <Stack sx={{ width: VALUE_WIDTH, alignItems: 'center', rowGap: 0 }}>
      <Typography
        component="span"
        aria-live="polite"
        sx={(theme) => ({
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1.2,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          ...(slowed ? redInk(theme) : { color: 'text.primary' }),
        })}
      >
        {value}
      </Typography>
      <Typography
        component="span"
        sx={{
          typography: 'caption',
          fontWeight: 700,
          lineHeight: 1.1,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: kkTokens.type.tracking.label,
          transform: 'scale(0.82)',
        }}
      >
        {caption}
      </Typography>
    </Stack>
    <ButtonBase aria-label={fasterLabel} disabled={!canFaster} onClick={onFaster} sx={stepPaint}>
      <AddRoundedIcon fontSize="small" />
    </ButtonBase>
  </Stack>
);
