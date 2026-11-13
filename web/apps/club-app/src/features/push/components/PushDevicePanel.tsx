import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import type { FC } from 'react';
import { usePushTopics } from '../hooks/use-push-topics';
import { PUSH_SECTION_TITLE, PUSH_TOPICS_SHEET_ID } from '../push-copy';
import { PushDeviceSwitch } from './PushDeviceSwitch';
import { PushTopicsRow } from './PushTopicsRow';
import { PushTopicsSheet } from './PushTopicsSheet';

export const PushDevicePanel: FC = () => {
  const topics = usePushTopics();
  const sheets = useKkSheetCommands();
  if (topics.hearsNothing) {
    return null;
  }

  const openTopics = (): void => {
    sheets.open(PUSH_TOPICS_SHEET_ID);
  };

  const topicsRow =
    topics.tallyLabel === undefined ? null : (
      <PushTopicsRow tallyLabel={topics.tallyLabel} onChoose={openTopics} />
    );

  return (
    <KkPanelSection title={PUSH_SECTION_TITLE}>
      <KkPanel variant="block">
        <PushDeviceSwitch />
        {topicsRow}
      </KkPanel>
      <PushTopicsSheet control={topics} />
    </KkPanelSection>
  );
};
