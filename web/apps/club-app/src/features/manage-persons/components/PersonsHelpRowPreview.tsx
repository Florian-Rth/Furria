import { KkChip } from '@furria/ui/KkChip';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toMembershipStateChip } from '@/lib/state-chips';
import { toAppStateChip } from '../person-app-state';

const SAMPLE_NAME = 'Anna Becker';
const SAMPLE_INITIALS = 'AB';
const SAMPLE_GROUPS = 'Kindergarde · Tanzmariechen';
const SAMPLE_ROLE = 'Trainerin';
const MEMBERSHIP_CHIP = toMembershipStateChip('active');
const APP_CHIP = toAppStateChip('active');
const APP_CHIP_LABEL = APP_CHIP?.label ?? '';
const APP_CHIP_TONE = APP_CHIP?.tone ?? 'neutral';
const APP_CHIP_DOT = APP_CHIP?.dot ?? false;

const TRAILING = (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.625, flexWrap: 'wrap' }}>
    <KkChip tone={MEMBERSHIP_CHIP.tone} dot={MEMBERSHIP_CHIP.dot} size="small">
      {MEMBERSHIP_CHIP.label}
    </KkChip>
    <KkChip tone={APP_CHIP_TONE} dot={APP_CHIP_DOT} size="small">
      {APP_CHIP_LABEL}
    </KkChip>
  </Stack>
);

export const PersonsHelpRowPreview: FC = () => (
  <KkPersonRow
    initials={SAMPLE_INITIALS}
    name={SAMPLE_NAME}
    accent={SAMPLE_ROLE}
    meta={SAMPLE_GROUPS}
    trailing={TRAILING}
  />
);
