import { KkChip } from '@furria/ui/KkChip';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { MINOR_CHIP } from '../manage-membership-applications-labels';

const SAMPLE_NAME = 'Lea Hoffmann';
const SAMPLE_INITIALS = 'LH';
const SAMPLE_META = '16 Jahre · Furth · seit 2 Tagen';

const MINOR = (
  <KkChip tone={MINOR_CHIP.tone} dot={MINOR_CHIP.dot} size="small">
    {MINOR_CHIP.label}
  </KkChip>
);

export const ApplicationsHelpRowPreview: FC = () => (
  <KkPersonRow initials={SAMPLE_INITIALS} name={SAMPLE_NAME} meta={SAMPLE_META} trailing={MINOR} />
);
