import { KkNote, KkPageWatermark, KkPanelStack } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { relevantSessionYear } from '@/lib/club';
import { formatSessionLabel } from '@/lib/membership-labels';
import { useManageHubQuery } from '../api';
import {
  isBoardEmpty,
  MANAGE_EMPTY_NOTE,
  toManageBanks,
  toManageTiles,
} from '../manage-hub-labels';
import { toManageHubErrorMessage } from '../manage-hub-messages';
import { ManageBank } from './ManageBank';
import { ManageError } from './ManageError';
import { ManageSkeleton } from './ManageSkeleton';

const BANK_SPACING = { xs: 3.5, desktop: 3 };
const BANK_SIZE = { xs: 12, desktop: 4 };
const CELL_SX = { minWidth: 0 } as const;

export const ManageBody: FC = () => {
  const manageHub = useManageHubQuery();
  const errorMessage = toManageHubErrorMessage(manageHub.error);
  const sessionLabel = formatSessionLabel(relevantSessionYear(new Date()));

  const reload = (): void => {
    void manageHub.refetch();
  };

  if (manageHub.data !== undefined) {
    const tiles = toManageTiles(manageHub.data, sessionLabel);
    const banks = toManageBanks(tiles);
    const bankCells = banks.map((bank) => (
      <Grid key={bank.id} size={BANK_SIZE} sx={CELL_SX}>
        <ManageBank bank={bank} />
      </Grid>
    ));
    const emptyNote = isBoardEmpty(tiles) ? (
      <KkNote tone="hint" icon="info">
        {MANAGE_EMPTY_NOTE}
      </KkNote>
    ) : null;

    return (
      <KkPanelStack>
        {emptyNote}
        <Grid container spacing={BANK_SPACING} sx={CELL_SX}>
          {bankCells}
        </Grid>
        <KkPageWatermark />
      </KkPanelStack>
    );
  }
  if (errorMessage !== null) {
    return <ManageError message={errorMessage} onRetry={reload} />;
  }

  return <ManageSkeleton />;
};
