import { KkFocusBar } from '@furria/ui/KkFocusBar';
import { KkFocusCards } from '@furria/ui/KkFocusCards';
import { KkFocusPop } from '@furria/ui/KkFocusPop';
import type { FC } from 'react';
import { FOCUS_CARDS, FOCUS_SETUP_CARD, FOCUS_UNDO } from '../focus-copy';
import type { FocusHistory } from '../hooks/use-focus-editor';
import type { FocusSetup } from '../hooks/use-focus-setup';

interface FocusSetupCardProps {
  setup: FocusSetup;
  history: FocusHistory;
}

const FIRST = 0;

export const FocusSetupCard: FC<FocusSetupCardProps> = ({ setup, history }) => {
  const rows = setup.actions.map((action) => (
    <KkFocusPop.Row
      key={action.task}
      lead={action.number}
      text={action.text}
      meta={action.hint}
      state={action.state}
      onPress={action.run}
    />
  ));
  const ignore = (): void => undefined;
  const next =
    setup.progress.items.find((item) => item.state === 'next')?.number ?? setup.progress.total;
  const cannotUndo = !history.canUndo;

  return (
    <KkFocusCards label={FOCUS_CARDS} index={FIRST} onSettle={ignore}>
      <KkFocusCards.Card label={FOCUS_SETUP_CARD} current={false}>
        <KkFocusCards.Head number={next} name={FOCUS_SETUP_CARD} meta={setup.chip} />
        {rows}
        <KkFocusCards.Row label={FOCUS_UNDO}>
          <KkFocusBar.Chip
            glyph="undo"
            text={FOCUS_UNDO}
            disabled={cannotUndo}
            onPress={history.undo}
          />
        </KkFocusCards.Row>
      </KkFocusCards.Card>
    </KkFocusCards>
  );
};
