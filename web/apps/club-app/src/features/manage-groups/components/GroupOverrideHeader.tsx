import { KkButton, KkMeta, KkNote, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toArchivedSinceLine } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const CLEAR_LABEL = 'Auswahl aufheben';
const NO_DESCRIPTION_LINE = 'Zu dieser Gruppe steht noch nichts geschrieben.';

const HEADER = {
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 1.5,
  flexWrap: 'wrap',
  minWidth: 0,
} as const;

const TEXT = { gap: 0.75, minWidth: 0, flexGrow: 1, flexBasis: '18rem' } as const;

interface GroupOverrideHeaderProps {
  group: ManagedGroupSummary;
  onClear: () => void;
}

export const GroupOverrideHeader: FC<GroupOverrideHeaderProps> = ({ group, onClear }) => {
  const description =
    group.description.trim() === '' ? (
      <KkMeta italic>{NO_DESCRIPTION_LINE}</KkMeta>
    ) : (
      <KkText>{group.description}</KkText>
    );

  const note =
    group.archivedOn === null ? null : <KkNote>{toArchivedSinceLine(group.archivedOn)}</KkNote>;

  return (
    <Stack direction="row" sx={HEADER}>
      <Stack sx={TEXT}>
        {description}
        {note}
      </Stack>
      <KkButton size="small" variant="text" onClick={onClear}>
        {CLEAR_LABEL}
      </KkButton>
    </Stack>
  );
};
