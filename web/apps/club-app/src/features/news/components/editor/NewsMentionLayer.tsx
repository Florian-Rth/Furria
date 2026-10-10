import type { KkMentionEditorLabels } from '@furria/ui';
import { KkMentionEditor, KkMentionPicker } from '@furria/ui';
import type { FC } from 'react';
import {
  MENTION_DONE,
  MENTION_EMPTY,
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
  listId: string;
}

const EDITOR_LABELS: KkMentionEditorLabels = {
  field: MENTION_LABEL_FIELD,
  target: MENTION_TARGET,
  remove: MENTION_REMOVE,
  done: MENTION_DONE,
};

export const NewsMentionLayer: FC<NewsMentionLayerProps> = ({ text, mentionables, listId }) => {
  const layer = useMentionLayer(text, mentionables);
  const selected = text.selectedMention;
  const label = selected?.label ?? '';
  const targetName = layer.target?.name ?? label;
  const targetLine = layer.target?.line ?? '';

  return (
    <>
      <KkMentionPicker
        listId={listId}
        label={MENTION_LIST_LABEL}
        emptyLabel={MENTION_EMPTY}
        anchor={text.mentionAnchor}
        sections={layer.sections}
        activeId={text.activeChoiceId}
        onChoose={text.chooseMention}
      />
      <KkMentionEditor
        anchor={text.mentionElement}
        label={label}
        targetName={targetName}
        targetLine={targetLine}
        note={layer.targetNote}
        labels={EDITOR_LABELS}
        onLabelChange={text.relabelMention}
        onRemove={text.removeMention}
        onClose={text.closeMention}
      />
    </>
  );
};
