import type { KkMentionEditorLabels } from '@furria/ui/KkMentionEditor';
import { KkMentionEditor } from '@furria/ui/KkMentionEditor';
import { KkMentionPicker } from '@furria/ui/KkMentionPicker';
import type { FC } from 'react';
import {
  MENTION_DONE,
  MENTION_LABEL_FIELD,
  MENTION_LIST_LABEL,
  MENTION_REMOVE,
  MENTION_TARGET,
} from '../../editor-copy';
import { useMentionLayer } from '../../hooks/use-mention-layer';
import type { ProseText } from '../../hooks/use-prose-text';
import type { NewsMentionable } from '../../types';

interface NewsMentionLayerProps {
  text: ProseText;
  mentionables: readonly NewsMentionable[];
  emptyLabel: string;
  listId: string;
}

const EDITOR_LABELS: KkMentionEditorLabels = {
  field: MENTION_LABEL_FIELD,
  target: MENTION_TARGET,
  remove: MENTION_REMOVE,
  done: MENTION_DONE,
};

export const NewsMentionLayer: FC<NewsMentionLayerProps> = ({
  text,
  mentionables,
  emptyLabel,
  listId,
}) => {
  const layer = useMentionLayer(text, mentionables);

  return (
    <>
      <KkMentionPicker
        listId={listId}
        label={MENTION_LIST_LABEL}
        emptyLabel={emptyLabel}
        anchor={layer.pickerAnchor}
        sections={layer.sections}
        activeId={layer.activeId}
        onChoose={layer.choose}
      />
      <KkMentionEditor
        anchor={layer.editorAnchor}
        label={layer.label}
        targetName={layer.targetName}
        targetLine={layer.targetLine}
        note={layer.targetNote}
        labels={EDITOR_LABELS}
        onLabelChange={layer.relabel}
        onRemove={layer.remove}
        onClose={layer.close}
      />
    </>
  );
};
