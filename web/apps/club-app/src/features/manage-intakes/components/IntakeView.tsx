import { KkPanelStack } from '@furria/ui/KkPanelStack';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { IntakeRenewalControl } from '../hooks/use-intake-renewal';
import type { IntakeShare } from '../hooks/use-intake-share';
import type { IntakeActions } from '../intake-rules';
import type { IntakeDetails } from '../schemas';
import { IntakeDecisionPanel } from './IntakeDecisionPanel';
import { IntakeDiscard } from './IntakeDiscard';
import { IntakeHistoryPanel } from './IntakeHistoryPanel';
import { IntakeLinkPanel } from './IntakeLinkPanel';
import { IntakeRenewDialog } from './IntakeRenewDialog';

const GRID_SPACING = { xs: 3.5, desktop: 5 };
const WIDE_SIZE = { xs: 12, desktop: 7 };
const NARROW_SIZE = { xs: 12, desktop: 5 };
const CELL_SX = { minWidth: 0 } as const;

interface IntakeViewProps {
  details: IntakeDetails;
  actions: IntakeActions;
  share: IntakeShare;
  renewal: IntakeRenewalControl;
  homePath: string;
}

export const IntakeView: FC<IntakeViewProps> = ({ details, actions, share, renewal, homePath }) => {
  const { intake } = details;
  const link = actions.showsLink ? <IntakeLinkPanel intake={intake} share={share} /> : null;
  const discard = actions.canDiscard ? <IntakeDiscard intake={intake} homePath={homePath} /> : null;

  return (
    <KkPanelStack>
      {link}
      <Grid container spacing={GRID_SPACING} sx={CELL_SX}>
        <Grid size={WIDE_SIZE} sx={CELL_SX}>
          <IntakeDecisionPanel intake={intake} />
        </Grid>
        <Grid size={NARROW_SIZE} sx={CELL_SX}>
          <IntakeHistoryPanel intake={intake} />
        </Grid>
      </Grid>
      {discard}
      <IntakeRenewDialog intake={intake} renewal={renewal} />
    </KkPanelStack>
  );
};
