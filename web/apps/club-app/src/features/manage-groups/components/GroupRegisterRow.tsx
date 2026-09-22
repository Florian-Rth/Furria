import { KkButton, KkRecordName, KkRegisterRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useState } from 'react';
import { toGroupTone } from '@/features/groups';
import { toLandingKey } from '@/features/write';
import { toGroupFactsLine, toGroupRegisterFlags } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { GroupRegisterFacts } from './GroupRegisterFacts';
import { GroupRegisterFlags } from './GroupRegisterFlags';
import { RestoreGroupDialog } from './RestoreGroupDialog';

const HUB_PATH = '/groups/$groupId';
const RESTORE_LABEL = 'Zurückholen';

const ROW = {
  gap: { xs: 1, desktop: 2.5 },
  minWidth: 0,
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;

const IDENTITY = { gap: 0.625, minWidth: 0, flexGrow: 1, flexBasis: '17rem' } as const;
const HEADLINE = { gap: 1, minWidth: 0, alignItems: 'center', flexWrap: 'wrap' } as const;
const ACTIONS = { minWidth: 0, flexBasis: { xs: '100%', desktop: 'auto' } } as const;

interface GroupRegisterRowProps {
  group: ManagedGroupSummary;
  highlight: boolean;
}

export const GroupRegisterRow: FC<GroupRegisterRowProps> = ({ group, highlight }) => {
  const isArchived = group.archivedOn !== null;
  const tone = isArchived ? undefined : toGroupTone(group.groupId, group.tone);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = (): void => {
    setConfirmOpen(true);
  };

  const closeConfirm = (): void => {
    setConfirmOpen(false);
  };

  const trailing = isArchived ? (
    <Stack sx={ACTIONS}>
      <KkButton
        size="small"
        variant="outlined"
        ariaLabel={`${group.name} ${RESTORE_LABEL}`}
        onClick={openConfirm}
      >
        {RESTORE_LABEL}
      </KkButton>
    </Stack>
  ) : null;

  const restoreDialog = isArchived ? (
    <RestoreGroupDialog group={group} open={confirmOpen} onClose={closeConfirm} />
  ) : null;

  return (
    <>
      <KkRegisterRow
        groupTone={tone}
        highlight={highlight}
        landing={toLandingKey('group', group.groupId)}
        component={isArchived ? undefined : Link}
        to={isArchived ? undefined : HUB_PATH}
        params={isArchived ? undefined : { groupId: String(group.groupId) }}
      >
        <Stack direction="row" sx={ROW}>
          <Stack sx={IDENTITY}>
            <Stack direction="row" sx={HEADLINE}>
              <KkRecordName name={group.name} dimmed={isArchived} />
              <GroupRegisterFlags flags={toGroupRegisterFlags(group)} />
            </Stack>
            <GroupRegisterFacts admins={group.admins} line={toGroupFactsLine(group)} />
          </Stack>
          {trailing}
        </Stack>
      </KkRegisterRow>
      {restoreDialog}
    </>
  );
};
