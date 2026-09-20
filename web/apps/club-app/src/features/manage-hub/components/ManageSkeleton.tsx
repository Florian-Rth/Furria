import { KkPanel, KkPanelSection, KkPanelStack, KkSkeletonBlock } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_LOADING_LABEL } from '../manage-hub-labels';
import type { ManageBankId, ManagePanelId } from '../manage-hub-panels';
import { MANAGE_BANKS, MANAGE_PANELS } from '../manage-hub-panels';

const BANK_SPACING = { xs: 3.5, desktop: 3 };
const BANK_SIZE = { xs: 12, desktop: 4 };
const TILE_SPACING = { xs: 1.5, desktop: 2 };
const TILE_SIZE = { xs: 6, sm: 4, desktop: 12 };
const WIDE_TILE_SIZE = { xs: 12, sm: 4, desktop: 12 };
const FULL_HEIGHT = { height: '100%' } as const;
const CELL_SX = { minWidth: 0 } as const;
const SKELETON_LINES = 3;

interface SkeletonSlot {
  id: ManagePanelId;
  isWide: boolean;
}

interface SkeletonBank {
  id: ManageBankId;
  title: string;
  slots: readonly SkeletonSlot[];
}

const SKELETON_BANKS: readonly SkeletonBank[] = MANAGE_BANKS.map((bank) => {
  const panels = MANAGE_PANELS.filter((panel) => panel.bank === bank.id);
  const lastIndex = panels.length - 1;
  const endsOdd = panels.length % 2 === 1;

  return {
    id: bank.id,
    title: bank.title,
    slots: panels.map((panel, index) => ({
      id: panel.id,
      isWide: endsOdd && index === lastIndex,
    })),
  };
});

export const ManageSkeleton: FC = () => {
  const bankCells = SKELETON_BANKS.map((bank) => (
    <Grid key={bank.id} size={BANK_SIZE} sx={CELL_SX}>
      <KkPanelSection title={bank.title}>
        <Grid container spacing={TILE_SPACING} sx={CELL_SX}>
          {bank.slots.map((slot) => (
            <Grid key={slot.id} size={slot.isWide ? WIDE_TILE_SIZE : TILE_SIZE} sx={CELL_SX}>
              <KkPanel variant="block" chevron={false} sx={FULL_HEIGHT}>
                <KkSkeletonBlock lines={SKELETON_LINES} />
              </KkPanel>
            </Grid>
          ))}
        </Grid>
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
