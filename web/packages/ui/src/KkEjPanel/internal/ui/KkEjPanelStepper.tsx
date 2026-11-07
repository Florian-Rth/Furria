import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkEjButton } from '../../../KkEjButton';

interface KkEjPanelStepperProps {
  value: string;
  previousLabel: string;
  nextLabel: string;
  previousLocked: boolean;
  nextLocked: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const KkEjPanelStepper: FC<KkEjPanelStepperProps> = ({
  value,
  previousLabel,
  nextLabel,
  previousLocked,
  nextLocked,
  onPrevious,
  onNext,
}) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
    <KkEjButton
      text={previousLabel}
      glyph="previous"
      textShown={false}
      disabled={previousLocked}
      onPress={onPrevious}
    />
    <Typography
      variant="body2"
      aria-live="polite"
      sx={{
        minWidth: '5.5rem',
        textAlign: 'center',
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </Typography>
    <KkEjButton
      text={nextLabel}
      glyph="next"
      textShown={false}
      disabled={nextLocked}
      onPress={onNext}
    />
  </Stack>
);
