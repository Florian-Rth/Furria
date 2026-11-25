import { KkChip } from '@furria/ui/KkChip';
import { KkFactRow } from '@furria/ui/KkFactRow';
import { KkPanel } from '@furria/ui/KkPanel';
import type { FC } from 'react';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import { toPeriodChip } from '@/lib/state-chips';
import { MEMBERSHIP_ROW_TITLE } from '../manage-persons-labels';

const RUNNING_START = '2022-11-11';
const EARLIER_SPAN = formatPeriod('2015-09-01', '2019-08-31');
const RUNNING_SPAN = formatPeriod(RUNNING_START, null);
const RUNNING_META = `Aufgenommen am ${formatIsoDay(RUNNING_START)}`;
const RUNNING_CHIP = toPeriodChip(true, false);
const CHIP_LABEL = RUNNING_CHIP?.label ?? '';
const CHIP_TONE = RUNNING_CHIP?.tone ?? 'neutral';
const CHIP_DOT = RUNNING_CHIP?.dot ?? false;

const CHIP = (
  <KkChip tone={CHIP_TONE} dot={CHIP_DOT} size="small">
    {CHIP_LABEL}
  </KkChip>
);

export const PersonHelpMembershipPreview: FC = () => (
  <KkPanel variant="list">
    <KkFactRow title={MEMBERSHIP_ROW_TITLE} span={RUNNING_SPAN} meta={RUNNING_META} chip={CHIP} />
    <KkFactRow title={MEMBERSHIP_ROW_TITLE} span={EARLIER_SPAN} />
  </KkPanel>
);
