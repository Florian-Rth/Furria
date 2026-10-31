import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';
import type { StepCardsSetup } from '../hooks/use-step-cards-setup';
import { useStudioMusicRoute } from '../hooks/use-studio-music-route';
import type { StudioScreen } from '../hooks/use-studio-screen';
import type { VisitHistory } from '../hooks/use-visit-history';
import {
  STEP_CARDS_DONE,
  STEP_CARDS_DONE_LABEL,
  STEP_CARDS_HEAD,
  STEP_CARDS_HISTORY,
  STEP_CARDS_MUSIC_PAGE,
  STEP_CARDS_REDO,
  STEP_CARDS_UNDO,
} from '../step-cards-copy';
import { StudioSetupChip } from './StudioSetupChip';

interface StepCardsHeadProps {
  screen: StudioScreen;
  history: VisitHistory;
  cardsSetup: StepCardsSetup;
}

export const StepCardsHead: FC<StepCardsHeadProps> = ({ screen, history, cardsSetup }) => {
  const openMusic = useStudioMusicRoute(screen.actId);
  const music = (): void => {
    openMusic('music');
  };
  const undoLocked = !history.canUndo;
  const redoLocked = !history.canRedo;
  const musicShown = screen.evening === null;
  const musicTextShown = !cardsSetup.setup.shown;
  const musicButton = musicShown ? (
    <KkLaneButton
      text={STEP_CARDS_MUSIC_PAGE}
      glyph="music"
      textShown={musicTextShown}
      onPress={music}
    />
  ) : null;

  return (
    <KkLaneBar label={STEP_CARDS_HEAD}>
      <KkLaneBar.Group label={STEP_CARDS_HISTORY} grow>
        <KkLaneButton
          text={STEP_CARDS_UNDO}
          glyph="undo"
          textShown={false}
          disabled={undoLocked}
          onPress={history.undo}
        />
        <KkLaneButton
          text={STEP_CARDS_REDO}
          glyph="redo"
          textShown={false}
          disabled={redoLocked}
          onPress={history.redo}
        />
      </KkLaneBar.Group>
      <StudioSetupChip
        setup={cardsSetup.setup}
        expanded={cardsSetup.open}
        onToggle={cardsSetup.toggle}
      />
      {musicButton}
      <KkLaneButton
        text={STEP_CARDS_DONE}
        glyph="check"
        label={STEP_CARDS_DONE_LABEL}
        onPress={screen.mode.toggle}
      />
    </KkLaneBar>
  );
};
