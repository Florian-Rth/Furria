import { KkNote } from '@furria/ui';
import type { FC } from 'react';
import { toGroupsIntroSentence } from '../groups-labels';

interface GroupsIntroProps {
  total: number;
  recruiting: number;
}

export const GroupsIntro: FC<GroupsIntroProps> = ({ total, recruiting }) => (
  <KkNote>{toGroupsIntroSentence(total, recruiting)}</KkNote>
);
