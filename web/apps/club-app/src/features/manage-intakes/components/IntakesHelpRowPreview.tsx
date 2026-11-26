import { KkPanel } from '@furria/ui/KkPanel';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { IntakeStateChip } from './IntakeStateChip';

const REVIEW_NAME = 'Mia Schuster';
const REVIEW_INITIALS = 'MS';
const REVIEW_META = 'eingereicht 22.11.2026 · Kindergarde';
const OPEN_NAME = 'neue Tänzerin';
const OPEN_INITIALS = 'NT';
const OPEN_META = 'noch 5 Tage · Mitglied ab 01.12.2026 · Kindergarde';

export const IntakesHelpRowPreview: FC = () => (
  <KkPanel variant="list">
    <KkPersonRow
      initials={REVIEW_INITIALS}
      name={REVIEW_NAME}
      meta={REVIEW_META}
      trailing={<IntakeStateChip state="needsReview" size="small" />}
    />
    <KkPersonRow
      initials={OPEN_INITIALS}
      name={OPEN_NAME}
      meta={OPEN_META}
      trailing={<IntakeStateChip state="open" size="small" />}
    />
  </KkPanel>
);
