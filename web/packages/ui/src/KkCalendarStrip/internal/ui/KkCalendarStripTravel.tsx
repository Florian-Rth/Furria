import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import { calendarToolGroupPaint, calendarToolPaint } from '../../calendar-tool-paint';

interface KkCalendarStripTravelProps {
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  sx?: KkSx;
}

export const KkCalendarStripTravel: FC<KkCalendarStripTravelProps> = ({
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  sx,
}) => (
  <Stack
    direction="row"
    role="group"
    data-kk-calendar-strip-travel
    sx={[calendarToolGroupPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <ButtonBase aria-label={previousLabel} onClick={onPrevious} sx={calendarToolPaint}>
      <KkIcon name="back" size="small" />
    </ButtonBase>
    <ButtonBase aria-label={nextLabel} onClick={onNext} sx={calendarToolPaint}>
      <KkIcon name="chevron" size="small" />
    </ButtonBase>
  </Stack>
);
