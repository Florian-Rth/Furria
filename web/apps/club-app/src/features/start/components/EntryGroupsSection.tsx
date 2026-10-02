import { KkChip, KkGroupToneChip, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { EntryGroupChip } from '../hooks/use-entry-sheet';

const OWNER_TITLE = 'Eigentümer';
const PARTICIPATING_TITLE = 'Mitwirkende Gruppen';
const CLUB_LABEL = 'Verein';
const CHIP_ROW = { gap: 0.75, flexWrap: 'wrap', minWidth: 0 } as const;

interface EntryGroupsSectionProps {
  owner: EntryGroupChip | null;
  participating: readonly EntryGroupChip[];
}

export const EntryGroupsSection: FC<EntryGroupsSectionProps> = ({ owner, participating }) => {
  const ownerChip =
    owner === null ? (
      <KkChip size="small">{CLUB_LABEL}</KkChip>
    ) : (
      <KkGroupToneChip tone={owner.tone} size="small">
        {owner.name}
      </KkGroupToneChip>
    );

  const participatingChips = participating.map((group) => (
    <KkGroupToneChip key={group.groupId} tone={group.tone} size="small">
      {group.name}
    </KkGroupToneChip>
  ));

  const participatingSection =
    participatingChips.length === 0 ? null : (
      <KkPanelSection title={PARTICIPATING_TITLE}>
        <Stack direction="row" sx={CHIP_ROW}>
          {participatingChips}
        </Stack>
      </KkPanelSection>
    );

  return (
    <>
      <KkPanelSection title={OWNER_TITLE}>
        <Stack direction="row" sx={CHIP_ROW}>
          {ownerChip}
        </Stack>
      </KkPanelSection>
      {participatingSection}
    </>
  );
};
