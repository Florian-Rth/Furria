import { KkButton } from '@furria/ui/KkButton';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useClubGroupJoin } from '../hooks/use-club-group-join';
import {
  CLUB_GROUP_JOIN_LABEL,
  CLUB_GROUP_JOIN_LINE,
  CLUB_GROUP_JOIN_TITLE,
} from '../start-labels';

const ROW = { gap: 1.5, alignItems: 'center', minWidth: 0 } as const;
const TEXT = { gap: 0.25, flexGrow: 1, minWidth: 0 } as const;

interface ClubGroupJoinCardProps {
  inviteLink: string;
}

export const ClubGroupJoinCard: FC<ClubGroupJoinCardProps> = ({ inviteLink }) => {
  const join = useClubGroupJoin(inviteLink);

  return (
    <KkPanel variant="block" tone="raised">
      <Stack direction="row" sx={ROW}>
        <Stack sx={TEXT}>
          <KkText variant="subtitle2">{CLUB_GROUP_JOIN_TITLE}</KkText>
          <KkText variant="caption" tone="secondary">
            {CLUB_GROUP_JOIN_LINE}
          </KkText>
        </Stack>
        <KkButton size="small" onClick={join}>
          {CLUB_GROUP_JOIN_LABEL}
        </KkButton>
      </Stack>
    </KkPanel>
  );
};
