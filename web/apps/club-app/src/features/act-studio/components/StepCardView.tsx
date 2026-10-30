import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { ActStudioStepTool } from '../hooks/use-act-studio-step-tool';
import type { StepCardTool } from '../hooks/use-step-card-tools';
import type { StepCard } from '../hooks/use-step-cards';
import type { StepTexts } from '../hooks/use-step-texts';
import type { StudioScreen } from '../hooks/use-studio-screen';
import type { VisitHistory } from '../hooks/use-visit-history';
import {
  STEP_CARD_ACTIONS,
  STEP_CARD_MARK,
  STEP_CARD_MARK_LABEL,
  STEP_CARD_NAME,
  STEP_CARD_STEP,
  STEP_CARD_STEP_LABEL,
  STEP_CARDS_UNDO,
} from '../step-cards-copy';
import { StepCardCounts } from './StepCardCounts';
import { StepCardCountsLive } from './StepCardCountsLive';
import { StepCardStage } from './StepCardStage';
import { StepCardStill } from './StepCardStill';
import { StepCardTools } from './StepCardTools';

interface StepCardViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  stepTool: ActStudioStepTool;
  card: StepCard;
  texts: StepTexts;
  tools: readonly StepCardTool[];
  history: VisitHistory;
}

const NO_COUNT = -1;

export const StepCardView: FC<StepCardViewProps> = ({
  screen,
  editor,
  stepTool,
  card,
  texts,
  tools,
  history,
}) => {
  const { playback } = screen;
  const seek = (seconds: number): void => {
    playback.player.seek(seconds);
  };
  const still = card.near ? (
    <StepCardStill screen={screen} editor={editor} seconds={card.start} />
  ) : null;
  const stage = card.current ? <StepCardStage screen={screen} editor={editor} /> : still;
  const toolBar = card.current ? <StepCardTools tools={tools} /> : null;
  const counts = card.current ? (
    <StepCardCountsLive playback={playback} cells={card.cells} onSeek={seek} />
  ) : (
    <StepCardCounts cells={card.cells} lit={NO_COUNT} onSeek={seek} />
  );
  const writesSteps = card.current && screen.evening === null;
  const stepLocked = !writesSteps;
  const markLocked = stepLocked || !stepTool.canMark;
  const undoLocked = !card.current || !history.canUndo;

  return (
    <KkLaneCards.Card label={card.label} current={card.current}>
      <KkLaneCards.Title
        eyebrow={card.eyebrow}
        lead={card.number}
        name={card.name}
        label={STEP_CARD_NAME}
        editable={writesSteps}
        onChange={texts.rename}
        onCommit={texts.commit}
      />
      <KkLaneCards.Stage>{stage}</KkLaneCards.Stage>
      {toolBar}
      {counts}
      <KkLaneCards.Foot>
        <KkLaneBar.Group label={STEP_CARD_ACTIONS}>
          <KkLaneButton
            text={STEP_CARD_MARK}
            glyph="add"
            label={STEP_CARD_MARK_LABEL}
            disabled={markLocked}
            onPress={stepTool.markHere}
          />
          <KkLaneButton
            text={STEP_CARD_STEP}
            glyph="steps"
            label={STEP_CARD_STEP_LABEL}
            disabled={stepLocked}
            onPress={stepTool.openDesk}
          />
          <KkLaneButton
            text={STEP_CARDS_UNDO}
            glyph="undo"
            disabled={undoLocked}
            onPress={history.undo}
          />
        </KkLaneBar.Group>
      </KkLaneCards.Foot>
    </KkLaneCards.Card>
  );
};
