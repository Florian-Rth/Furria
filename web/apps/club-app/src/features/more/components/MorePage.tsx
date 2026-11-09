import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_SECTION } from '@/features/session/app-sections';
import { MORE_TITLE } from '../more-labels';
import { MoreBody } from './MoreBody';

export const MorePage: FC = () => (
  <KkScreen
    kind="overview"
    section={MORE_SECTION}
    title={MORE_TITLE}
    header={<KkTitleHeader title={MORE_TITLE} />}
    handover={AREA_HANDOVERS.more}
  >
    <MoreBody />
  </KkScreen>
);
