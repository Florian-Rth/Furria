import { KkFocusCards } from '@furria/ui/KkFocusCards';
import type { FC } from 'react';
import { FOCUS_CARDS } from '../focus-copy';
import { useFocusCards } from '../hooks/use-focus-cards';
import type { FocusEditor } from '../hooks/use-focus-editor';
import { FocusSetupCard } from './FocusSetupCard';
import { FocusStepCard } from './FocusStepCard';

interface FocusStripProps {
  editor: FocusEditor;
}

export const FocusStrip: FC<FocusStripProps> = ({ editor }) => {
  const strip = useFocusCards(editor.screen);

  if (strip.cards.length === 0) {
    return <FocusSetupCard setup={editor.setup} history={editor.history} />;
  }

  const cards = strip.cards.map((card) => (
    <FocusStepCard key={card.key} editor={editor} card={card} />
  ));

  return (
    <KkFocusCards label={FOCUS_CARDS} index={strip.index} onSettle={editor.jumpToIndex}>
      {cards}
    </KkFocusCards>
  );
};
