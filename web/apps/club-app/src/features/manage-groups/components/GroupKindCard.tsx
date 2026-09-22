import { KkButton, KkChip, KkPanel, KkRecordName } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import type { GroupKindEntry } from '../manage-groups-labels';
import { toGroupKindUsageBadge } from '../manage-groups-labels';
import { RestoreGroupKindDialog } from './RestoreGroupKindDialog';

const PANEL = { height: '100%' } as const;
const CARD = { gap: 1.125, minWidth: 0, height: '100%' } as const;
const HEADLINE = {
  gap: 1,
  minWidth: 0,
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
} as const;
const FOOT = { minWidth: 0, marginTop: 'auto' } as const;

const RESTORE_LABEL = 'Zurückholen';
const GROUP_KIND_ROUTE = '/manage/groups/kinds/$groupKindId';

interface GroupKindCardProps {
  entry: GroupKindEntry;
  highlight: boolean;
}

export const GroupKindCard: FC<GroupKindCardProps> = ({ entry, highlight }) => {
  const usage = toGroupKindUsageBadge(entry);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = (): void => {
    setConfirmOpen(true);
  };

  const closeConfirm = (): void => {
    setConfirmOpen(false);
  };

  const restore = entry.isArchived ? (
    <Stack sx={FOOT}>
      <KkButton
        size="small"
        variant="outlined"
        ariaLabel={`${entry.name} ${RESTORE_LABEL}`}
        onClick={openConfirm}
      >
        {RESTORE_LABEL}
      </KkButton>
    </Stack>
  ) : null;

  const restoreDialog = entry.isArchived ? (
    <RestoreGroupKindDialog kind={entry} open={confirmOpen} onClose={closeConfirm} />
  ) : null;

  return (
    <>
      <KkPanel
        variant="block"
        dimmed={entry.isArchived}
        highlight={highlight}
        landing={toLandingKey('group-kind', entry.groupKindId)}
        component={entry.isArchived ? undefined : Link}
        to={entry.isArchived ? undefined : GROUP_KIND_ROUTE}
        params={entry.isArchived ? undefined : { groupKindId: String(entry.groupKindId) }}
        sx={PANEL}
      >
        <Stack sx={CARD}>
          <Stack direction="row" sx={HEADLINE}>
            <KkRecordName name={entry.name} dimmed={entry.isArchived} />
            <KkChip tone={usage.tone} dot={usage.dot} size="small">
              {usage.label}
            </KkChip>
          </Stack>
          {restore}
        </Stack>
      </KkPanel>
      {restoreDialog}
    </>
  );
};
