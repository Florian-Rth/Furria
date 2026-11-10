import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTimeField } from '@furria/ui/KkTimeField';
import type { FC } from 'react';
import {
  WINDOW_END_DAY_LABEL,
  WINDOW_END_HINT,
  WINDOW_END_TIME_LABEL,
  WINDOW_END_TITLE,
} from '../claim-window-copy';
import type { WindowEndFields } from '../claim-window-format';

interface ClaimWindowEndSectionProps {
  end: WindowEndFields;
  onDayChange: (day: string | null) => void;
  onTimeChange: (time: string) => void;
}

export const ClaimWindowEndSection: FC<ClaimWindowEndSectionProps> = ({
  end,
  onDayChange,
  onTimeChange,
}) => (
  <KkFormSection title={WINDOW_END_TITLE}>
    <KkDateField
      name="closesOn"
      label={WINDOW_END_DAY_LABEL}
      value={end.day}
      onChange={onDayChange}
      required
    />
    <KkTimeField
      name="closesAt"
      label={WINDOW_END_TIME_LABEL}
      value={end.time}
      onChange={onTimeChange}
      hint={WINDOW_END_HINT}
      required
    />
  </KkFormSection>
);
