import type { KkMentionEditorLabels } from '@furria/ui/KkMentionEditor';
import { KkMentionEditor } from '@furria/ui/KkMentionEditor';
import { KkMentionPicker } from '@furria/ui/KkMentionPicker';
import type { FC } from 'react';
import { useMentionLayer } from '../hooks/use-mention-layer';
import type { RichTextField } from '../hooks/use-rich-text';
import {
  MENTION_DONE,
  MENTION_LABEL_FIELD,
  MENTION_REMOVE,
  MENTION_TARGET,
  MENTION_WORD,
} from '../rich-text-copy';
import type { MentionablesSource } from '../types';

interface RichTextMentionLayerProps {
  text: RichTextField;
  source: MentionablesSource;
}

const EDITOR_LABELS: KkMentionEditorLabels = {
  field: MENTION_LABEL_FIELD,
  target: MENTION_TARGET,
  remove: MENTION_REMOVE,
  done: MENTION_DONE,
};

export const RichTextMentionLayer: FC<RichTextMentionLayerProps> = ({ text, source }) => {
  const layer = useMentionLayer(text, source);

  return (
    <>
      <KkMentionPicker
        listId={text.pickerListId}
        label={MENTION_WORD}
        emptyLabel={source.emptyLabel}
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
