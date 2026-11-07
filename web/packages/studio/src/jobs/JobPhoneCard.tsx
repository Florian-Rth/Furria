import { JobStage } from '@furria/studio/JobStage';
import { JobStageHead } from '@furria/studio/JobStageHead';
import { JOB_CARD_NAME, JOB_CARD_STAGE } from '@furria/studio/job-copy';
import { StepCardCounts } from '@furria/studio/StepCardCounts';
import { StepCardCountsLive } from '@furria/studio/StepCardCountsLive';
import { StepCardStill } from '@furria/studio/StepCardStill';
import { StepListPanel } from '@furria/studio/StepListPanel';
import type { JobPhone } from '@furria/studio/use-job-phone';
import type { StepCard } from '@furria/studio/use-step-cards';
import { KkEditorStage } from '@furria/ui/KkEditorStage';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import { KkStageHead } from '@furria/ui/KkStageHead';
import type { FC } from 'react';

interface JobPhoneCardProps {
  jobPhone: JobPhone;
  card: StepCard;
}

const NO_COUNT = -1;

export const JobPhoneCard: FC<JobPhoneCardProps> = ({ jobPhone, card }) => {
  const { screen, stage: editor, cards } = jobPhone;
  const { playback } = screen;
  const seek = (seconds: number): void => {
    playback.player.seek(seconds);
  };
  const bigNames = jobPhone.jobs.job === 'cast';
  const eyebrow = jobPhone.eyebrows.get(card.key) ?? card.eyebrow;
  const still = card.near ? (
    <KkEditorStage>
      <KkStageHead />
      <KkEditorStage.Bleed>
        <StepCardStill screen={screen} editor={editor} seconds={card.start} />
      </KkEditorStage.Bleed>
    </KkEditorStage>
  ) : null;
  const stepsJob = jobPhone.jobs.job === 'steps';
  const list = (
    <KkEditorStage>
      <StepListPanel screen={screen} />
    </KkEditorStage>
  );
  const liveStage = card.current ? (
    <KkEditorStage>
      <JobStageHead
        screen={screen}
        editor={editor}
        job={jobPhone.jobs.job}
        total={jobPhone.arrange.placed}
      />
      <KkEditorStage.Bleed>
        <JobStage
          screen={screen}
          editor={editor}
          arrange={jobPhone.arrange}
          label={JOB_CARD_STAGE}
          named
          bigNames={bigNames}
          nameSize="small"
        />
      </KkEditorStage.Bleed>
    </KkEditorStage>
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
      label={JOB_CARD_NAME}
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
