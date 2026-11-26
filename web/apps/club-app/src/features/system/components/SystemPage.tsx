import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, MORE_SECTION, SYSTEM_TITLE } from '@/features/session/app-sections';
import { useSystemHelpViewer } from '../hooks/use-system-help-viewer';
import { SystemBody } from './SystemBody';
import { SystemHelp } from './SystemHelp';

export const SystemPage: FC = () => {
  const helpViewer = useSystemHelpViewer();
  const help = toScreenHelp(<SystemHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={SYSTEM_TITLE}
      header={<KkTitleHeader title={SYSTEM_TITLE} />}
      handover={AREA_HANDOVERS.system}
      headerKind="title"
      help={help}
    >
      <SystemBody />
    </KkScreen>
  );
};
