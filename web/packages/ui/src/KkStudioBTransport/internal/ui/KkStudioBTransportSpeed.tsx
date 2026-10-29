import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';

const readoutPaint =
  (slowed: boolean) =>
  (theme: Theme): CSSObject => ({
    minWidth: '2.75rem',
    fontFamily: kkTokens.font.display,
    typography: 'subtitle1',
    lineHeight: 1,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: slowed
      ? (theme.vars ?? theme).palette.text.primary
      : (theme.vars ?? theme).palette.text.secondary,
  });

interface KkStudioBTransportSpeedProps {
  value: string;
  slowed: boolean;
  label: string;
  slowerLabel: string;
  fasterLabel: string;
  canSlow: boolean;
  canSpeed: boolean;
  onSlower: () => void;
  onFaster: () => void;
}

export const KkStudioBTransportSpeed: FC<KkStudioBTransportSpeedProps> = ({
  value,
  slowed,
  label,
  slowerLabel,
  fasterLabel,
  canSlow,
  canSpeed,
  onSlower,
  onFaster,
}) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-studio-b-speed
    sx={{ alignItems: 'center', flexShrink: 0 }}
  >
    <KkIconButton
      icon="subtract"
      size="small"
      label={slowerLabel}
      disabled={!canSlow}
      onClick={onSlower}
    />
    <Box component="output" aria-live="polite" sx={readoutPaint(slowed)}>
      {value}
    </Box>
    <KkIconButton
      icon="add"
      size="small"
      label={fasterLabel}
      disabled={!canSpeed}
      onClick={onFaster}
    />
  </Stack>
);
