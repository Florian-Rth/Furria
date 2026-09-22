import { KkEmptyState, KkEyebrow, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGED_GROUPS_EMPTY, REGISTER_TITLE } from '../manage-groups-labels';
import type { GroupRegisterBands, GroupWorkFilterId } from '../manage-groups-work';
import { countBandedGroups, toRegisterMeta } from '../manage-groups-work';
import { GroupRegisterBand } from './GroupRegisterBand';

const ARCHIVED_BAND_TITLE = 'Archiviert';

const BAND_LABEL = { pt: 2.25, pb: 0.5, minWidth: 0 } as const;

interface GroupRegisterProps {
  bands: GroupRegisterBands;
  filter: GroupWorkFilterId;
  isFiltered: boolean;
  onAppointAdmin: (groupId: number) => void;
  onEdit: (groupId: number) => void;
  onArchive: (groupId: number) => void;
  onRestore: (groupId: number) => void;
}

export const GroupRegister: FC<GroupRegisterProps> = ({
  bands,
  filter,
  isFiltered,
  onAppointAdmin,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const shown = countBandedGroups(bands);
  const empty = isFiltered ? MANAGED_GROUPS_EMPTY.filtered : MANAGED_GROUPS_EMPTY.cold;

  const archivedLabel =
    bands.archived.length === 0 ? null : (
      <Stack sx={BAND_LABEL}>
        <KkEyebrow tone="muted" size="small">
          {ARCHIVED_BAND_TITLE}
        </KkEyebrow>
      </Stack>
    );

  const body =
    shown === 0 ? (
      <KkPanel variant="block">
        <KkEmptyState title={empty.title} description={empty.description} />
      </KkPanel>
    ) : (
      <KkPanel variant="list">
        <GroupRegisterBand
          groups={bands.running}
          onAppointAdmin={onAppointAdmin}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
        />
        {archivedLabel}
        <GroupRegisterBand
          groups={bands.archived}
          onAppointAdmin={onAppointAdmin}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      </KkPanel>
    );

  return (
    <KkPanelSection title={REGISTER_TITLE} meta={toRegisterMeta(filter, bands)}>
      {body}
    </KkPanelSection>
  );
};
