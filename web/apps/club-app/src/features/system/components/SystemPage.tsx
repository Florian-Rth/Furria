import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_SECTION, SYSTEM_TITLE } from '@/features/session';
import { SYSTEM_LEAD } from '../system-copy';
import { SystemBody } from './SystemBody';

export const SystemPage: FC = () => (
  <KkScreen
    kind="overview"
    section={MORE_SECTION}
    title={SYSTEM_TITLE}
    header={<KkTitleHeader title={SYSTEM_TITLE} lead={SYSTEM_LEAD} />}
    handover={AREA_HANDOVERS.system}
    headerKind="title"
  >
    <SystemBody />
  </KkScreen>
);
