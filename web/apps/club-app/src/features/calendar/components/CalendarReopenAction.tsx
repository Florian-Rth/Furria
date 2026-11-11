import { KkButton } from '@furria/ui/KkButton';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';

const REOPEN_LABEL = 'Wieder öffnen';

interface CalendarReopenActionProps {
  isReopening: boolean;
  onReopen: () => void;
  sx?: KkSx;
}

export const CalendarReopenAction: FC<CalendarReopenActionProps> = ({
  isReopening,
  onReopen,
  sx,
}) => (
  <KkButton variant="outlined" size="small" onClick={onReopen} loading={isReopening} sx={sx}>
    {REOPEN_LABEL}
  </KkButton>
);
