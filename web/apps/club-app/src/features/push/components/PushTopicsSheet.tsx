import { KkSheet } from '@furria/ui/KkSheet';
import type { KkSheetAction } from '@furria/ui/sheet-actions';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import type { FC } from 'react';
import type { PushTopicsControl } from '../hooks/use-push-topics';
import {
  PUSH_TOPICS_SHEET_CLOSE,
  PUSH_TOPICS_SHEET_DONE,
  PUSH_TOPICS_SHEET_ID,
  PUSH_TOPICS_SHEET_TITLE,
} from '../push-copy';
import { PushTopicSwitches } from './PushTopicSwitches';

interface PushTopicsSheetProps {
  control: PushTopicsControl;
}

export const PushTopicsSheet: FC<PushTopicsSheetProps> = ({ control }) => {
  const sheets = useKkSheetCommands();
  const done: KkSheetAction = { label: PUSH_TOPICS_SHEET_DONE, onClick: sheets.close };

  return (
    <KkSheet
      id={PUSH_TOPICS_SHEET_ID}
      title={PUSH_TOPICS_SHEET_TITLE}
      closeLabel={PUSH_TOPICS_SHEET_CLOSE}
    >
      <KkSheet.Body>
        <PushTopicSwitches control={control} />
      </KkSheet.Body>
      <KkSheet.Actions primary={done} />
    </KkSheet>
  );
};
