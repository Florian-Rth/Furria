import { KkNote } from '@furria/ui/KkNote';
import { KkPageWatermark } from '@furria/ui/KkPageWatermark';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { LabEntryRow } from '@/features/lab/components/LabEntryRow';
import { relevantSessionYear } from '@/lib/club';
import { formatSessionLabel } from '@/lib/membership-labels';
import { useManageHubQuery } from '../api';
import { isBoardEmpty, MANAGE_EMPTY_NOTE, toManageBanks, toManageRows } from '../manage-hub-labels';
import { toManageHubErrorMessage } from '../manage-hub-messages';
import { ManageBank } from './ManageBank';
import { ManageError } from './ManageError';
import { ManageSkeleton } from './ManageSkeleton';
import { ManageToDosPanel } from './ManageToDosPanel';

const BANK_SPACING = { xs: 3.5, desktop: 3 };
const BANK_SIZE = { xs: 12, desktop: 4 };
const CELL_SX = { minWidth: 0 } as const;
const TO_DOS_CELL_KEY = 'to-dos';

export const ManageBody: FC = () => {
  const manageHub = useManageHubQuery();
  const errorMessage = toManageHubErrorMessage(manageHub.error);
  const sessionLabel = formatSessionLabel(relevantSessionYear(new Date()));

  const reload = (): void => {
    void manageHub.refetch();
  };

  if (manageHub.data !== undefined) {
    const rows = toManageRows(manageHub.data, sessionLabel);
    const banks = toManageBanks(rows);
    const { toDos } = manageHub.data;
    const toDosCell =
      toDos.length === 0 ? null : (
        <Grid key={TO_DOS_CELL_KEY} size={BANK_SIZE} sx={CELL_SX}>
          <ManageToDosPanel toDos={toDos} />
        </Grid>
      );
    const bankCells = banks.map((bank) => (
      <Grid key={bank.id} size={BANK_SIZE} sx={CELL_SX}>
        <ManageBank bank={bank} />
      </Grid>
    ));
    const emptyNote = isBoardEmpty(rows) ? (
      <KkNote tone="hint" icon="info">
        {MANAGE_EMPTY_NOTE}
      </KkNote>
    ) : null;

    return (
      <KkPanelStack>
        {emptyNote}
        <Grid container spacing={BANK_SPACING} sx={CELL_SX}>
          {toDosCell}
          {bankCells}
        </Grid>
        <LabEntryRow />
        <KkPageWatermark />
      </KkPanelStack>
    );
  }
  if (errorMessage !== null) {
    return <ManageError message={errorMessage} onRetry={reload} />;
  }

  return <ManageSkeleton />;
};
