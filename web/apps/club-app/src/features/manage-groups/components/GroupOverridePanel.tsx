import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ManagedGroupSummary } from '../schemas';
import { GroupOverrideBody } from './GroupOverrideBody';
import { GroupOverrideHeader } from './GroupOverrideHeader';

const PANEL = { gap: 2.5, minWidth: 0 } as const;

interface GroupOverridePanelProps {
  group: ManagedGroupSummary;
  appointToken: number | null;
  onClear: () => void;
}

export const GroupOverridePanel: FC<GroupOverridePanelProps> = ({
  group,
  appointToken,
  onClear,
}) => (
  <Stack sx={PANEL}>
    <GroupOverrideHeader group={group} onClear={onClear} />
    <GroupOverrideBody groupId={group.groupId} appointToken={appointToken} />
  </Stack>
);
