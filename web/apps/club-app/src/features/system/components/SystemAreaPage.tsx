import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, SYSTEM_ORIGIN } from '@/features/session/app-sections';
import { SECTION_TITLES } from '../system-copy';
import type { SystemArea } from '../types';
import { SystemAreaBody } from './SystemAreaBody';
import { SystemAreaHeader } from './SystemAreaHeader';
import { SystemAreaHelp } from './SystemAreaHelp';

interface SystemAreaPageProps {
  area: SystemArea;
}

export const SystemAreaPage: FC<SystemAreaPageProps> = ({ area }) => {
  const help = toScreenHelp(<SystemAreaHelp area={area} />);

  return (
    <KkScreen
      kind="working"
      title={SECTION_TITLES[area]}
      origin={SYSTEM_ORIGIN}
      header={<SystemAreaHeader area={area} />}
      handover={AREA_HANDOVERS.system}
      help={help}
    >
      <SystemAreaBody area={area} />
    </KkScreen>
  );
};
