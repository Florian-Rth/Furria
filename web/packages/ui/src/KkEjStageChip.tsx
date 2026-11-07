import CloseRounded from '@mui/icons-material/CloseRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const INNER_RING = -4;

interface KkEjStageChipProps {
  text: string;
  clearLabel: string;
  onClear: () => void;
}

export const KkEjStageChip: FC<KkEjStageChipProps> = ({ text, clearLabel, onClear }) => (
  <Stack
    direction="row"
    data-kk-ej-stage-chip
    sx={(theme) => ({
      alignItems: 'center',
      minWidth: 0,
      maxWidth: '100%',
      height: kkTokens.tapTarget,
      pl: 1.25,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: palette(theme).background.paper,
      backgroundColor: palette(theme).text.primary,
    })}
  >
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={{ fontWeight: 800, color: 'inherit', fontVariantNumeric: 'tabular-nums', minWidth: 0 }}
    >
      {text}
    </Typography>
    <ButtonBase
      aria-label={clearLabel}
      onClick={onClear}
      sx={(theme) => ({
        flexShrink: 0,
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        borderRadius: `${kkTokens.radius.pill}px`,
        color: 'inherit',
        '&:focus-visible': {
          outline: `${kkTokens.line.section}px solid`,
          outlineColor: palette(theme).background.paper,
          outlineOffset: INNER_RING,
        },
      })}
    >
      <CloseRounded aria-hidden fontSize="small" />
    </ButtonBase>
  </Stack>
);
