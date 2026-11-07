import { StepCardCounts } from '@furria/studio/StepCardCounts';
import { StepCardCountsLive } from '@furria/studio/StepCardCountsLive';
import { StepCardStill } from '@furria/studio/StepCardStill';
import type { StepCard } from '@furria/studio/use-step-cards';
import { KkEjCardStage } from '@furria/ui/KkEjCardStage';
import { KkEjStageHead } from '@furria/ui/KkEjStageHead';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';
import { EJ_CARD_NAME, EJ_CARD_STAGE } from '../edit-jobs-copy';
import type { EjPhone } from '../hooks/use-ej-phone';
import { EjStage } from './EjStage';
import { EjStageHead } from './EjStageHead';
import { EjStepsJob } from './EjStepsJob';

interface EjPhoneCardProps {
  ej: EjPhone;
  card: StepCard;
}

const NO_COUNT = -1;

export const EjPhoneCard: FC<EjPhoneCardProps> = ({ ej, card }) => {
  const { screen, stage: editor, cards } = ej;
  const { playback } = screen;
  const seek = (seconds: number): void => {
    playback.player.seek(seconds);
  };
  const bigNames = ej.jobs.job === 'cast';
  const eyebrow = ej.eyebrows.get(card.key) ?? card.eyebrow;
  const still = card.near ? (
    <KkEjCardStage>
      <KkEjStageHead />
      <KkEjCardStage.Bleed>
        <StepCardStill screen={screen} editor={editor} seconds={card.start} />
      </KkEjCardStage.Bleed>
    </KkEjCardStage>
  ) : null;
  const stepsJob = ej.jobs.job === 'steps';
  const list = (
    <KkEjCardStage>
      <EjStepsJob screen={screen} />
    </KkEjCardStage>
  );
  const liveStage = card.current ? (
    <KkEjCardStage>
      <EjStageHead screen={screen} editor={editor} job={ej.jobs.job} total={ej.arrange.placed} />
      <KkEjCardStage.Bleed>
        <EjStage
          screen={screen}
          editor={editor}
          arrange={ej.arrange}
          label={EJ_CARD_STAGE}
          named
          bigNames={bigNames}
          nameSize="small"
        />
      </KkEjCardStage.Bleed>
    </KkEjCardStage>
  ) : (
    still
  );
  const shownStage = stepsJob && (card.current || card.near) ? list : liveStage;
  const cardCounts = card.current ? (
    <StepCardCountsLive playback={playback} cells={card.cells} onSeek={seek} />
  ) : (
    <StepCardCounts cells={card.cells} lit={NO_COUNT} onSeek={seek} />
  );
  const counts = stepsJob ? null : cardCounts;
  const title = stepsJob ? null : (
    <KkLaneCards.Title
      eyebrow={eyebrow}
      lead={card.number}
      name={card.name}
      label={EJ_CARD_NAME}
      editable={false}
      onChange={cards.texts.rename}
      onCommit={cards.texts.commit}
    />
  );

  return (
    <KkLaneCards.Card label={card.label} current={card.current}>
      {title}
      <KkLaneCards.Stage>{shownStage}</KkLaneCards.Stage>
      {counts}
    </KkLaneCards.Card>
  );
};
