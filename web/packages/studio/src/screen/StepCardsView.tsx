import { ActStudioSpotSheet } from '@furria/studio/ActStudioSpotSheet';
import { ActStudioStepDesk } from '@furria/studio/ActStudioStepDesk';
import { StepCardsEmpty } from '@furria/studio/StepCardsEmpty';
import { StepCardsHead } from '@furria/studio/StepCardsHead';
import { StepCardsSetupPanel } from '@furria/studio/StepCardsSetupPanel';
import { StepCardsTransport } from '@furria/studio/StepCardsTransport';
import { StepCardView } from '@furria/studio/StepCardView';
import { StudioSetupInputs } from '@furria/studio/StudioSetupInputs';
import { STEP_CARDS_LABEL, STEP_CARDS_LIST } from '@furria/studio/step-cards-copy';
import { studioBandOf } from '@furria/studio/studio-copy';
import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import { useStepCardTools } from '@furria/studio/use-step-card-tools';
import { useStepCards } from '@furria/studio/use-step-cards';
import { useStepCardsSetup } from '@furria/studio/use-step-cards-setup';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';

interface StepCardsViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardsView: FC<StepCardsViewProps> = ({ screen, editor }) => {
  const stepTool = useActStudioStepTool(screen);
  const cards = useStepCards(screen, editor);
  const tools = useStepCardTools(screen, editor);
  const cardsSetup = useStepCardsSetup(screen, editor);
  const keysActive = !editor.sheetOpen && !stepTool.deskOpen && !cardsSetup.open;
  useStudioKeys(scrubKeyActionsOf(screen, null), keysActive);
  const bandText = studioBandOf(screen.evening, screen.mode.editing);
  const band = bandText === null ? null : <KkStudioView.BandNote text={bandText} />;
  const views = cards.cards.map((card) => (
    <StepCardView
      key={card.key}
      screen={screen}
      editor={editor}
      stepTool={stepTool}
      card={card}
      texts={cards.texts}
      tools={tools}
    />
  ));
  const cardsBody =
    views.length === 0 ? (
      <StepCardsEmpty screen={screen} stepTool={stepTool} />
    ) : (
      <KkLaneCards label={STEP_CARDS_LIST} index={cards.index} onIndex={cards.choose}>
        {views}
      </KkLaneCards>
    );
  const body = cardsSetup.open ? <StepCardsSetupPanel cardsSetup={cardsSetup} /> : cardsBody;

  return (
    <KkLanePhone label={STEP_CARDS_LABEL}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <StepCardsHead screen={screen} cardsSetup={cardsSetup} />
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">{body}</KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <StepCardsTransport screen={screen} />
      </KkLanePhone.Area>
      <ActStudioSpotSheet screen={screen} editor={editor} />
      <ActStudioStepDesk screen={screen} tool={stepTool} />
      <StudioSetupInputs setup={cardsSetup.setup} />
    </KkLanePhone>
  );
};
