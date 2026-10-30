import { KkFocusCards } from '@furria/ui/KkFocusCards';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import { FOCUS_COUNTS } from '../focus-copy';
import { currentCellOf } from '../focus-counts';
import type { FocusCard } from '../hooks/use-focus-cards';
import type { FocusEditor } from '../hooks/use-focus-editor';

interface FocusCardCountsProps {
  editor: FocusEditor;
  card: FocusCard;
}

export const FocusCardCounts: FC<FocusCardCountsProps> = ({ editor, card }) => {
  const current = usePlaybackSelection(editor.screen.playback.player, (seconds) =>
    currentCellOf(card.cells, seconds),
  );

  return (
    <KkFocusCards.Counts
      label={FOCUS_COUNTS}
      eights={card.eights}
      current={current}
      onSeek={card.seek}
    />
  );
};
