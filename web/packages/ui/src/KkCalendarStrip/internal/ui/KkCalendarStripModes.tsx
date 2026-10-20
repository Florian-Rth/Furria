import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import type { KkCalendarStripMode } from '../../calendar-strip-types';
import { calendarToolGroupPaint, calendarToolPaint } from '../../calendar-tool-paint';

const MODES: readonly KkCalendarStripMode[] = ['days', 'hours'];
const MODE_ICONS = { days: 'list', hours: 'clock' } as const;

interface KkCalendarStripModesProps {
  label: string;
  labels: Record<KkCalendarStripMode, string>;
  value: KkCalendarStripMode;
  onChange: (mode: KkCalendarStripMode) => void;
  sx?: KkSx;
}

export const KkCalendarStripModes: FC<KkCalendarStripModesProps> = ({
  label,
  labels,
  value,
  onChange,
  sx,
}) => {
  const pressOf: Record<KkCalendarStripMode, () => void> = {
    days: () => onChange('days'),
    hours: () => onChange('hours'),
  };
  const segments = MODES.map((mode) => (
    <ButtonBase
      key={mode}
      aria-label={labels[mode]}
      aria-pressed={mode === value}
      onClick={pressOf[mode]}
      data-kk-calendar-strip-mode={mode}
      sx={calendarToolPaint}
    >
      <KkIcon name={MODE_ICONS[mode]} size="small" />
    </ButtonBase>
  ));

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      sx={[calendarToolGroupPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {segments}
    </Stack>
  );
};
