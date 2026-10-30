import { KkFocusOutline } from '@furria/ui/KkFocusOutline';
import type { FC } from 'react';
import {
  FOCUS_OUTLINE,
  FOCUS_PART_HERE,
  FOCUS_STEP_HERE,
  FOCUS_STEP_REMOVE,
  FOCUS_STEP_REMOVE_SURE,
} from '../focus-copy';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusOutlinePaneProps {
  editor: FocusEditor;
}

export const FocusOutlinePane: FC<FocusOutlinePaneProps> = ({ editor }) => {
  const { outline } = editor;
  const groups = outline.groups.map((group) => {
    const rows = group.steps.map((step) => (
      <KkFocusOutline.Step
        key={step.key}
        number={step.number}
        name={step.name}
        meta={step.meta}
        label={step.label}
        current={step.current}
        rename={step.rename}
        onPress={step.press}
      />
    ));
    const headKey = `part-${group.key}`;

    return [
      <KkFocusOutline.Part
        key={headKey}
        name={group.name}
        meta={group.meta}
        rename={group.rename}
      />,
      ...rows,
    ];
  });
  const removeText = outline.removing ? FOCUS_STEP_REMOVE_SURE : FOCUS_STEP_REMOVE;
  const cannotMark = !outline.canMark;
  const cannotOpenPart = !outline.canOpenPart;
  const cannotRemove = !outline.canRemove;

  return (
    <KkFocusOutline label={FOCUS_OUTLINE}>
      {groups}
      <KkFocusOutline.Action
        glyph="add"
        text={FOCUS_STEP_HERE}
        disabled={cannotMark}
        onPress={outline.markHere}
      />
      <KkFocusOutline.Action
        glyph="add"
        text={FOCUS_PART_HERE}
        disabled={cannotOpenPart}
        onPress={outline.openPart}
      />
      <KkFocusOutline.Action
        glyph="remove"
        text={removeText}
        tone="danger"
        disabled={cannotRemove}
        onPress={outline.remove}
      />
    </KkFocusOutline>
  );
};
