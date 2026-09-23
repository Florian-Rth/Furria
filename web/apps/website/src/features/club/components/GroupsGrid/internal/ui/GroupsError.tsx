import { KkButton, KkErrorState } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { groupsLabels, groupsMailHref } from '@/features/club/groups-content';

interface GroupsErrorProps {
  onRetry: () => void;
}

export const GroupsError: FC<GroupsErrorProps> = ({ onRetry }) => (
  <KkErrorState
    title={groupsLabels.errorTitle}
    description={groupsLabels.errorText}
    action={
      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}>
        <KkButton onClick={onRetry}>{groupsLabels.errorRetry}</KkButton>
        <KkButton variant="outlined" href={groupsMailHref}>
          {groupsLabels.askCta}
        </KkButton>
      </Stack>
    }
  />
);
