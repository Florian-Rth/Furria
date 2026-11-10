import Stack from '@mui/material/Stack';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import type { FC } from 'react';
import { KkFieldChoices } from '../../../internal/KkFieldChoices';
import { buildTimeChoices, parseClockTime, toClockTime } from '../../../internal/time-field';
import { KkBottomDrawer } from '../../../KkBottomDrawer/KkBottomDrawer';
import { KkButton } from '../../../KkButton';
import { kkTokens } from '../../../tokens';
import { KkMomentFieldLabel } from './KkMomentFieldLabel';

const CLOSE_LABEL = 'Schließen';
const DONE_LABEL = 'Fertig';
const TIME_VIEWS = ['hours', 'minutes'] as const;
const MINUTE_STEPS = { hours: 1, minutes: 1 } as const;
const FINISHED_SELECTION = 'finish';
const CLOCK_SX = {
  width: '100%',
  borderBottom: 0,
  '& .MuiMultiSectionDigitalClockSection-root': { flex: '1 1 0', borderLeft: 0 },
  '& .MuiMultiSectionDigitalClockSection-item': {
    width: '100%',
    mx: 0,
    justifyContent: 'center',
    borderRadius: `${kkTokens.radius.chip}px`,
    fontVariantNumeric: 'tabular-nums',
  },
} as const;

interface KkMomentTimeDrawerProps {
  open: boolean;
  label: string;
  time: string;
  quickTimes: readonly string[];
  onTimeChange: (time: string) => void;
  onClose: () => void;
}

export const KkMomentTimeDrawer: FC<KkMomentTimeDrawerProps> = ({
  open,
  label,
  time,
  quickTimes,
  onTimeChange,
  onClose,
}) => {
  const choices = buildTimeChoices(quickTimes, null);

  const pickQuickTime = (picked: string): void => {
    onTimeChange(picked);
    onClose();
  };

  const turnClock = (value: Date | null, state?: string): void => {
    const picked = toClockTime(value);

    if (picked !== null) {
      onTimeChange(picked);
    }
    if (state === FINISHED_SELECTION) {
      onClose();
    }
  };

  const quickRow =
    choices.length === 0 ? null : (
      <KkFieldChoices label={label} choices={choices} selectedId={time} onSelect={pickQuickTime} />
    );

  return (
    <KkBottomDrawer open={open} label={label} closeLabel={CLOSE_LABEL} onClose={onClose}>
      <Stack sx={{ gap: 1.5, px: 2, pb: 2, overflowY: 'auto' }}>
        <KkMomentFieldLabel label={label} />
        {quickRow}
        <MultiSectionDigitalClock
          value={parseClockTime(time)}
          onChange={turnClock}
          views={TIME_VIEWS}
          timeSteps={MINUTE_STEPS}
          ampm={false}
          sx={CLOCK_SX}
        />
        <KkButton fullWidth onClick={onClose}>
          {DONE_LABEL}
        </KkButton>
      </Stack>
    </KkBottomDrawer>
  );
};
