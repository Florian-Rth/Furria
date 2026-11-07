import {
  STEP_CARD_ACTIONS,
  STEP_CARD_FIRST_MARK,
  STEP_CARD_FIRST_MARK_LABEL,
  STEP_CARDS_EMPTY,
  STEP_CARDS_LABEL,
  STEP_CARDS_MUSIC_PAGE,
  STEP_CARDS_NO_MUSIC,
  STEP_CARDS_NO_STEP,
} from '@furria/studio/step-cards-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface StepCardsEmptyProps {
  screen: StudioScreen;
  stepTool: ActStudioStepTool;
}

export const StepCardsEmpty: FC<StepCardsEmptyProps> = ({ screen, stepTool }) => {
  const music = (): void => {
    screen.openMusic('music');
  };
  const silent = screen.playback.length <= 0;
  const note = silent ? STEP_CARDS_NO_MUSIC : STEP_CARDS_NO_STEP;
  const action = silent ? (
    <KkLaneButton text={STEP_CARDS_MUSIC_PAGE} glyph="music" tone="accent" onPress={music} />
  ) : (
    <KkLaneButton
      text={STEP_CARD_FIRST_MARK}
      glyph="add"
      label={STEP_CARD_FIRST_MARK_LABEL}
      tone="accent"
      disabled={!stepTool.canMark}
      onPress={stepTool.markHere}
    />
  );

  return (
    <KkLaneDesk.Panel label={STEP_CARDS_EMPTY}>
      <KkLaneInspector>
        <KkLaneInspector.Head eyebrow={STEP_CARDS_LABEL} title={STEP_CARDS_EMPTY} />
        <KkLaneInspector.Note text={note} />
        <KkLaneInspector.Actions label={STEP_CARD_ACTIONS}>{action}</KkLaneInspector.Actions>
      </KkLaneInspector>
    </KkLaneDesk.Panel>
  );
};
