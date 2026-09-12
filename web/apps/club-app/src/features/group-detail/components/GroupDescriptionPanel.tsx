import { KkMeta, KkPanel, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toNoDescriptionLine } from '../group-detail-labels';

interface GroupDescriptionPanelProps {
  groupName: string;
  description: string;
}

export const GroupDescriptionPanel: FC<GroupDescriptionPanelProps> = ({
  groupName,
  description,
}) => {
  const text = description.trim();

  const body =
    text === '' ? (
      <KkMeta italic>{toNoDescriptionLine(groupName)}</KkMeta>
    ) : (
      <KkText tone="secondary">{text}</KkText>
    );

  return <KkPanel variant="block">{body}</KkPanel>;
};
