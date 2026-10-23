import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import type { FC } from 'react';
import { PlannerDetailSection } from '@/features/running-order/components/PlannerDetailSection';
import { GROUP_FIELD_LABEL, GROUP_TITLE } from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';

interface ActGroupChoiceProps {
  editor: ActEditor;
}

export const ActGroupChoice: FC<ActGroupChoiceProps> = ({ editor }) => {
  const value = editor.draft.groupId === null ? '' : String(editor.draft.groupId);

  return (
    <PlannerDetailSection title={GROUP_TITLE}>
      <KkChoiceChips
        label={GROUP_FIELD_LABEL}
        choices={editor.groupChoices}
        value={value}
        onChange={editor.chooseGroup}
      />
    </PlannerDetailSection>
  );
};
