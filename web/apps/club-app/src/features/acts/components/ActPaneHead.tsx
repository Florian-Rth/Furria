import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkHeadlineField } from '@furria/ui/KkHeadlineField';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import { PlannerLineMark } from '@/features/running-order/components/PlannerLineMark';
import { ActKindSchema } from '@/features/running-order/schemas';
import {
  CLOSE_LABEL,
  KIND_CHOICE_LABEL,
  NAME_LABEL,
  NAME_PLACEHOLDER,
  POINT_CONTEXT,
  SESSION_CHOICE_LABEL,
  toNameIssueText,
  toPaneTitle,
} from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';

interface ActPaneHeadProps {
  editor: ActEditor;
  onClose?: () => void;
}

export const ActPaneHead: FC<ActPaneHeadProps> = ({ editor, onClose }) => {
  const nameId = useId();
  const context = editor.isNew
    ? toPaneTitle(true)
    : (editor.headerAct.group?.name ?? POINT_CONTEXT);
  const close =
    onClose === undefined ? null : (
      <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
    );
  const issue =
    editor.showsNameIssue && editor.state.nameIssue !== null ? (
      <KkMeta tone="accent">{toNameIssueText(editor.state.nameIssue)}</KkMeta>
    ) : null;
  const sessionValue = String(editor.draft.sessionYear);
  const session = editor.showsSession ? (
    <KkChoiceChips
      label={SESSION_CHOICE_LABEL}
      choices={editor.sessionChoices}
      value={sessionValue}
      onChange={editor.chooseSession}
    />
  ) : null;
  const chooseKind = (id: string): void => {
    const parsed = ActKindSchema.safeParse(id);

    if (parsed.success) {
      editor.chooseKind(parsed.data);
    }
  };

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <PlannerLineMark act={editor.headerAct} />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <KkMeta>{context}</KkMeta>
          <KkHeadlineField
            id={nameId}
            label={NAME_LABEL}
            placeholder={NAME_PLACEHOLDER}
            value={editor.draft.name}
            size="pane"
            readOnly={editor.closed}
            onChange={editor.rename}
          />
        </Stack>
        {close}
      </Stack>
      {issue}
      <KkChoiceChips
        label={KIND_CHOICE_LABEL}
        choices={editor.kindChoices}
        value={editor.draft.kind}
        onChange={chooseKind}
      />
      {session}
    </Stack>
  );
};
