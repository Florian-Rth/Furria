import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkPillButton } from '../../../KkPillButton';

interface KkJobPanelStepperProps {
  value: string;
  previousLabel: string;
  nextLabel: string;
  previousLocked: boolean;
  nextLocked: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const KkJobPanelStepper: FC<KkJobPanelStepperProps> = ({
  value,
  previousLabel,
  nextLabel,
  previousLocked,
  nextLocked,
  onPrevious,
  onNext,
}) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
    <KkPillButton
      text={previousLabel}
      glyph="left"
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
    <KkPillButton
      text={nextLabel}
      glyph="right"
      textShown={false}
      disabled={nextLocked}
      onPress={onNext}
    />
  </Stack>
);
