import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_LOADING_LABEL } from '../manage-hub-labels';
import type { ManageBankId } from '../manage-hub-panels';
import { MANAGE_BANKS, MANAGE_PANELS } from '../manage-hub-panels';

const BANK_SPACING = { xs: 3.5, desktop: 3 };
const BANK_SIZE = { xs: 12, desktop: 4 };
const CELL_SX = { minWidth: 0 } as const;

interface SkeletonBank {
  id: ManageBankId;
  title: string;
  rowCount: number;
}

const SKELETON_BANKS: readonly SkeletonBank[] = MANAGE_BANKS.map((bank) => ({
  id: bank.id,
  title: bank.title,
  rowCount: MANAGE_PANELS.filter((panel) => panel.bank === bank.id).length,
}));

export const ManageSkeleton: FC = () => {
  const bankCells = SKELETON_BANKS.map((bank) => (
    <Grid key={bank.id} size={BANK_SIZE} sx={CELL_SX}>
      <KkPanelSection title={bank.title}>
        <KkPanel>
          <KkSkeletonRow count={bank.rowCount} shape="select" />
        </KkPanel>
      </KkPanelSection>
    </Grid>
  ));

  return (
    <AppSkeletonRegion label={MANAGE_LOADING_LABEL}>
      <KkPanelStack>
        <Grid container spacing={BANK_SPACING} sx={CELL_SX}>
          {bankCells}
        </Grid>
      </KkPanelStack>
    </AppSkeletonRegion>
  );
};
