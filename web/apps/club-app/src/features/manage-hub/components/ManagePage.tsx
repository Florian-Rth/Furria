import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, MORE_SECTION } from '@/features/session/app-sections';
import { useManageHelpViewer } from '../hooks/use-manage-help-viewer';
import { MANAGE_TITLE } from '../manage-hub-labels';
import { ManageBody } from './ManageBody';
import { ManageHeader } from './ManageHeader';
import { ManageHelp } from './ManageHelp';

export const ManagePage: FC = () => {
  const helpViewer = useManageHelpViewer();
  const help =
    helpViewer === undefined ? undefined : toScreenHelp(<ManageHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={MANAGE_TITLE}
      header={<ManageHeader />}
      handover={AREA_HANDOVERS.manage}
      headerKind="title"
      help={help}
    >
      <ManageBody />
    </KkScreen>
  );
};
