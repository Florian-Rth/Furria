import { KkFocusBar } from '@furria/ui/KkFocusBar';
import { KkFocusCards } from '@furria/ui/KkFocusCards';
import type { FC } from 'react';
import { FOCUS_CHIPS, FOCUS_COUNTS, FOCUS_UNDO } from '../focus-copy';
import type { FocusCard } from '../hooks/use-focus-cards';
import type { FocusEditor } from '../hooks/use-focus-editor';
import { FocusCardCounts } from './FocusCardCounts';
import { FocusChipList } from './FocusChipList';

interface FocusStepCardProps {
  editor: FocusEditor;
  card: FocusCard;
}

const NO_COUNT = -1;

export const FocusStepCard: FC<FocusStepCardProps> = ({ editor, card }) => {
  const { history, chips } = editor;
  const cannotUndo = !history.canUndo;
  const counts = card.current ? (
    <FocusCardCounts editor={editor} card={card} />
  ) : (
    <KkFocusCards.Counts
      label={FOCUS_COUNTS}
      eights={card.eights}
      current={NO_COUNT}
      onSeek={card.seek}
    />
  );

  return (
    <KkFocusCards.Card label={card.label} current={card.current}>
      <KkFocusCards.Head number={card.number} name={card.name} meta={card.meta} />
      <KkFocusCards.Row label={FOCUS_CHIPS}>
        <KkFocusBar.Chip
          glyph="undo"
          text={FOCUS_UNDO}
          disabled={cannotUndo}
          onPress={history.undo}
        />
        <KkFocusBar.Divider />
        <FocusChipList chips={chips.chips} />
      </KkFocusCards.Row>
      {counts}
    </KkFocusCards.Card>
  );
};
