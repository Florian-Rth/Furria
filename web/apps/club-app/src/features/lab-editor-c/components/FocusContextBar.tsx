import { KkFocusBar } from '@furria/ui/KkFocusBar';
import type { FC } from 'react';
import { FOCUS_CONTEXT } from '../focus-copy';
import type { FocusEditor } from '../hooks/use-focus-editor';
import { FocusChipList } from './FocusChipList';

interface FocusContextBarProps {
  editor: FocusEditor;
}

export const FocusContextBar: FC<FocusContextBarProps> = ({ editor }) => (
  <KkFocusBar label={FOCUS_CONTEXT} kind="float">
    <KkFocusBar.Note text={editor.chips.note} />
    <KkFocusBar.Divider />
    <FocusChipList chips={editor.chips.chips} />
  </KkFocusBar>
);
