import { StepCardCounts } from '@furria/studio/StepCardCounts';
import { StepCardCountsLive } from '@furria/studio/StepCardCountsLive';
import { StepCardStage } from '@furria/studio/StepCardStage';
import { StepCardStill } from '@furria/studio/StepCardStill';
import { StepCardTools } from '@furria/studio/StepCardTools';
import {
  STEP_CARD_ACTIONS,
  STEP_CARD_MARK,
  STEP_CARD_MARK_LABEL,
  STEP_CARD_NAME,
  STEP_CARD_STEP,
  STEP_CARD_STEP_LABEL,
  STEP_CARDS_UNDO,
} from '@furria/studio/step-cards-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { ActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import type { StepCardTool } from '@furria/studio/use-step-card-tools';
import type { StepCard } from '@furria/studio/use-step-cards';
import type { StepTexts } from '@furria/studio/use-step-texts';
import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';

interface StepCardViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  stepTool: ActStudioStepTool;
  card: StepCard;
  texts: StepTexts;
  tools: readonly StepCardTool[];
}

const NO_COUNT = -1;

export const StepCardView: FC<StepCardViewProps> = ({
  screen,
  editor,
  stepTool,
  card,
  texts,
  tools,
}) => {
  const { history, playback } = screen;
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
            textShown={false}
            disabled={undoLocked}
            onPress={history.undo}
          />
        </KkLaneBar.Group>
      </KkLaneCards.Foot>
    </KkLaneCards.Card>
  );
};
