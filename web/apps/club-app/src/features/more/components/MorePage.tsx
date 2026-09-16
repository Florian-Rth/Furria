import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MORE_SECTION } from '@/features/session';
import { MORE_LEAD, MORE_TITLE } from '../more-labels';
import { MoreBody } from './MoreBody';

export const MorePage: FC = () => {
  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={MORE_TITLE}
      header={<KkTitleHeader title={MORE_TITLE} lead={MORE_LEAD} />}
    >
      <MoreBody />
    </KkScreen>
  );
};
