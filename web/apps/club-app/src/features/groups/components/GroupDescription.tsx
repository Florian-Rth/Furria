import { KkMeta, KkPanel, KkPanelSection, KkText } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES, toNoDescriptionLine } from '../groups-labels';

interface GroupDescriptionProps {
  groupName: string;
  description: string;
}

export const GroupDescription: FC<GroupDescriptionProps> = ({ groupName, description }) => {
  const text = description.trim();

  const body =
    text === '' ? (
      <KkMeta italic>{toNoDescriptionLine(groupName)}</KkMeta>
    ) : (
      <KkText tone="secondary">{text}</KkText>
    );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.about}>
      <KkPanel variant="block">{body}</KkPanel>
    </KkPanelSection>
  );
};
