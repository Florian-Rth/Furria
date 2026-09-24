import { KkPanelHeader } from '@furria/ui';
import type { FC } from 'react';
import { toGroupCountLabel } from '../groups-labels';

interface GroupsSectionHeadingProps {
  title: string;
  count: number;
}

export const GroupsSectionHeading: FC<GroupsSectionHeadingProps> = ({ title, count }) => (
  <KkPanelHeader title={title} meta={toGroupCountLabel(count)} />
);
