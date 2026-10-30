import { KkLaneCards } from '@furria/ui/KkLaneCards';
import { KkLanePhone } from '@furria/ui/KkLanePhone';
import { KkStudioView } from '@furria/ui/KkStudioView';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import { useActStudioStepTool } from '../hooks/use-act-studio-step-tool';
import { useStepCardKeys } from '../hooks/use-step-card-keys';
import { useStepCardTools } from '../hooks/use-step-card-tools';
import { useStepCards } from '../hooks/use-step-cards';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { useVisitHistory } from '../hooks/use-visit-history';
import { STEP_CARDS_LABEL, STEP_CARDS_LIST } from '../step-cards-copy';
import { ActStudioSpotSheet } from './ActStudioSpotSheet';
import { ActStudioStepDesk } from './ActStudioStepDesk';
import { StepCardsEmpty } from './StepCardsEmpty';
import { StepCardsHead } from './StepCardsHead';
import { StepCardsTransport } from './StepCardsTransport';
import { StepCardView } from './StepCardView';

interface StepCardsViewProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardsView: FC<StepCardsViewProps> = ({ screen, editor }) => {
  const stepTool = useActStudioStepTool(screen);
  const cards = useStepCards(screen, editor);
  const tools = useStepCardTools(screen, editor);
  const history = useVisitHistory(screen.actId, screen.studio);
  useStepCardKeys(screen, !editor.sheetOpen && !stepTool.deskOpen);
  const band =
    screen.eveningBand === null ? null : <KkStudioView.BandNote text={screen.eveningBand} />;
  const views = cards.cards.map((card) => (
    <StepCardView
      key={card.key}
      screen={screen}
      editor={editor}
      stepTool={stepTool}
      card={card}
      texts={cards.texts}
      tools={tools}
      history={history}
    />
  ));
  const body =
    views.length === 0 ? (
      <StepCardsEmpty screen={screen} stepTool={stepTool} />
    ) : (
      <KkLaneCards label={STEP_CARDS_LIST} index={cards.index} onIndex={cards.choose}>
        {views}
      </KkLaneCards>
    );

  return (
    <KkLanePhone label={STEP_CARDS_LABEL}>
      <KkLanePhone.Area area="band">{band}</KkLanePhone.Area>
      <KkLanePhone.Area area="head">
        <StepCardsHead screen={screen} history={history} />
      </KkLanePhone.Area>
      <KkLanePhone.Area area="cards">{body}</KkLanePhone.Area>
      <KkLanePhone.Area area="transport">
        <StepCardsTransport screen={screen} />
      </KkLanePhone.Area>
      <ActStudioSpotSheet screen={screen} editor={editor} />
      <ActStudioStepDesk screen={screen} tool={stepTool} />
    </KkLanePhone>
  );
};
