import { KkPanelStack } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AccessPanel } from '@/features/account-access';
import { usePermissions } from '@/features/session';
import { useLanding } from '@/features/write';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toPersonGaps } from '../person-identity';
import type { PersonDetails } from '../schemas';
import { PersonAccessView } from './PersonAccessView';
import { PersonArchiveFoot } from './PersonArchiveFoot';
import { PersonDeletionLine } from './PersonDeletionLine';
import { PersonFeeReductionsPanel } from './PersonFeeReductionsPanel';
import { PersonGapsLine } from './PersonGapsLine';
import { PersonKeysPanel } from './PersonKeysPanel';
import { PersonMasterDataPanel } from './PersonMasterDataPanel';
import { PersonMembershipsPanel } from './PersonMembershipsPanel';
import { PersonStateRail } from './PersonStateRail';
import { PersonTiesPanel } from './PersonTiesPanel';

const GRID_SPACING = { xs: 3.5, desktop: 5 };
const RECORD_SIZE = { xs: 12, desktop: 7 };
const ACCESS_SIZE = { xs: 12, desktop: 5 };
const FOOT_OFFSET = { xs: 0, desktop: 7 };
const CELL_SX = { minWidth: 0 } as const;
const RAIL_SIZE = 12;
const RECORD_CELL_SX = { minWidth: 0, order: { xs: 2, desktop: 1 } } as const;
const ACCESS_CELL_SX = { minWidth: 0, order: { xs: 1, desktop: 2 } } as const;
const FOOT_CELL_SX = { minWidth: 0, order: 3 } as const;

interface PersonEditViewProps {
  person: PersonDetails;
}

export const PersonEditView: FC<PersonEditViewProps> = ({ person }) => {
  const { highlightedKey } = useLanding();
  const { has } = usePermissions();
  const gaps = toPersonGaps(person);
  const isArchived = person.archive !== null;

  const deletionLine = has(PERMISSION_KEYS.personsDelete) ? (
    <PersonDeletionLine person={person} />
  ) : null;

  if (!has(PERMISSION_KEYS.personsManage)) {
    return <PersonAccessView person={person} deletionLine={deletionLine} />;
  }

  const feeReductionsPanel = gaps.includes('feeReductions') ? null : (
    <PersonFeeReductionsPanel person={person} highlightedKey={highlightedKey} />
  );
  const tiesPanel = gaps.includes('ties') ? null : (
    <PersonTiesPanel person={person} highlightedKey={highlightedKey} />
  );
  const keysPanel = gaps.includes('keys') ? null : (
    <PersonKeysPanel
      personId={person.personId}
      holdings={person.unendedKeyHoldings}
      highlightedKey={highlightedKey}
    />
  );

  return (
    <Grid container spacing={GRID_SPACING} sx={CELL_SX}>
      <Grid size={RAIL_SIZE} sx={CELL_SX}>
        <PersonStateRail person={person} />
      </Grid>
      <Grid size={RECORD_SIZE} sx={RECORD_CELL_SX}>
        <KkPanelStack>
          <PersonMembershipsPanel person={person} highlightedKey={highlightedKey} />
          {feeReductionsPanel}
          {tiesPanel}
          {keysPanel}
          <PersonGapsLine personId={person.personId} gaps={gaps} canAddFeeReduction={!isArchived} />
        </KkPanelStack>
      </Grid>
      <Grid size={ACCESS_SIZE} sx={ACCESS_CELL_SX}>
        <KkPanelStack>
          <AccessPanel subject={person} highlightedKey={highlightedKey} />
          <PersonMasterDataPanel person={person} highlightedKey={highlightedKey} />
        </KkPanelStack>
      </Grid>
      <Grid size={ACCESS_SIZE} offset={FOOT_OFFSET} sx={FOOT_CELL_SX}>
        <KkPanelStack>
          <PersonArchiveFoot person={person} />
          {deletionLine}
        </KkPanelStack>
      </Grid>
    </Grid>
  );
};
