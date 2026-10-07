import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, MORE_SECTION, usePermissions } from '@/features/session';
import { MORE_LEAD, MORE_MANAGING_LEAD, MORE_TITLE } from '../more-labels';
import { MoreBody } from './MoreBody';

export const MorePage: FC = () => {
  const { isManagingLogin } = usePermissions();
  const lead = isManagingLogin ? MORE_MANAGING_LEAD : MORE_LEAD;

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={MORE_TITLE}
      header={<KkTitleHeader title={MORE_TITLE} lead={lead} />}
      handover={AREA_HANDOVERS.more}
    >
      <MoreBody />
    </KkScreen>
  );
};
