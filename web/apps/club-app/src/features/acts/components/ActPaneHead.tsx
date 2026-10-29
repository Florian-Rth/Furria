import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkHeadlineField } from '@furria/ui/KkHeadlineField';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import { PlannerLineMark } from '@/features/running-order/components/PlannerLineMark';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import { ACT_KINDS, ActKindSchema } from '@/features/running-order/schemas';
import {
  CLOSE_LABEL,
  KIND_CHOICE_LABEL,
  KIND_ICONS,
  NAME_LABEL,
  NAME_PLACEHOLDER,
  POINT_CONTEXT,
  toNameIssueText,
  toPaneTitle,
} from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';

const KIND_CHOICES: KkChoiceChip[] = ACT_KINDS.map((kind) => ({
  id: kind,
  label: toActKindLabel(kind),
  icon: KIND_ICONS[kind],
}));

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
            onChange={editor.rename}
          />
        </Stack>
        {close}
      </Stack>
      {issue}
      <KkChoiceChips
        label={KIND_CHOICE_LABEL}
        choices={KIND_CHOICES}
        value={editor.draft.kind}
        onChange={chooseKind}
      />
    </Stack>
  );
};
