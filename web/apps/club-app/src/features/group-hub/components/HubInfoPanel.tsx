import { KkMeta, KkPanel, KkText } from '@furria/ui';
import type { FC } from 'react';
import { toNoDescriptionLine } from '../group-hub-labels';

interface HubInfoPanelProps {
  groupName: string;
  description: string;
}

export const HubInfoPanel: FC<HubInfoPanelProps> = ({ groupName, description }) => {
  const text = description.trim();

  const body =
    text === '' ? (
      <KkMeta italic>{toNoDescriptionLine(groupName)}</KkMeta>
    ) : (
      <KkText tone="secondary">{text}</KkText>
    );

  return <KkPanel variant="block">{body}</KkPanel>;
};
