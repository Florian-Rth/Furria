import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import {
  LATER_SHEET_ID,
  LATER_SHEET_TITLE,
  LATER_STEPS,
  SHEET_CLOSE_LABEL,
} from '../event-plan-copy';

export const EventLaterSheet: FC = () => {
  const rows = LATER_STEPS.map((step) => (
    <KkFieldRow key={step.title} label={step.title} value={step.line} />
  ));

  return (
    <KkSheet id={LATER_SHEET_ID} title={LATER_SHEET_TITLE} closeLabel={SHEET_CLOSE_LABEL}>
      <KkSheet.Body>{rows}</KkSheet.Body>
    </KkSheet>
  );
};
