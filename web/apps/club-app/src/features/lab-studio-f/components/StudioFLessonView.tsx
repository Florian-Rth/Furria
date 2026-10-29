import { KkStudioFLesson } from '@furria/ui/KkStudioFLesson';
import { KkStudioFProgress } from '@furria/ui/KkStudioFProgress';
import { KkStudioFSpeed } from '@furria/ui/KkStudioFSpeed';
import { KkStudioFText } from '@furria/ui/KkStudioFText';
import { KkStudioFTitle } from '@furria/ui/KkStudioFTitle';
import { KkStudioFTransport } from '@furria/ui/KkStudioFTransport';
import { KkStudioFWhole } from '@furria/ui/KkStudioFWhole';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useStudioFLesson } from '../hooks/use-studio-f-lesson';
import {
  STUDIO_F_LESSON_LABEL,
  STUDIO_F_MUSIC_FAILED,
  STUDIO_F_NEXT,
  STUDIO_F_NO_DESCRIPTION,
  STUDIO_F_NO_STEPS,
  STUDIO_F_NO_STEPS_LINE,
  STUDIO_F_OPEN_DESCRIPTION,
  STUDIO_F_PAUSE,
  STUDIO_F_PLAY,
  STUDIO_F_PREVIOUS,
  STUDIO_F_PROGRESS_LABEL,
  STUDIO_F_SPEED_LABEL,
  STUDIO_F_WHOLE,
  studioFRateLabelOf,
} from '../studio-f-copy';
import { rateIdOf, STUDIO_F_RATES } from '../studio-f-lesson';
import { StudioFCount } from './StudioFCount';
import { StudioFMedia } from './StudioFMedia';
import { StudioFProgressFill } from './StudioFProgressFill';
import { StudioFStepSheet } from './StudioFStepSheet';

interface StudioFLessonViewProps {
  studio: Studio;
  viewerId: number | null;
}

const RATE_OPTIONS = STUDIO_F_RATES.map((rate) => ({
  id: rateIdOf(rate),
  label: studioFRateLabelOf(rateIdOf(rate)),
}));

export const StudioFLessonView: FC<StudioFLessonViewProps> = ({ studio, viewerId }) => {
  const lesson = useStudioFLesson(studio, viewerId);
  const { step, playback } = lesson;
  const fill = <StudioFProgressFill player={playback.player} step={step} />;
  const name = step?.name ?? STUDIO_F_NO_STEPS;
  const emptyText = step === null ? STUDIO_F_NO_STEPS_LINE : STUDIO_F_NO_DESCRIPTION;
  const text = lesson.failed ? null : (step?.description ?? null);
  const quietText = lesson.failed ? STUDIO_F_MUSIC_FAILED : emptyText;
  const noSteps = step === null;

  return (
    <KkStudioFLesson label={STUDIO_F_LESSON_LABEL}>
      <KkStudioFLesson.Head>
        <KkStudioFProgress
          label={STUDIO_F_PROGRESS_LABEL}
          segments={lesson.segments}
          fill={fill}
          onSelect={lesson.select}
        />
        <KkStudioFTitle
          number={lesson.number}
          name={name}
          part={lesson.partName}
          turn={lesson.textTurn}
        />
      </KkStudioFLesson.Head>
      <KkStudioFLesson.Media>
        <StudioFMedia studio={studio} lesson={lesson} />
      </KkStudioFLesson.Media>
      <KkStudioFLesson.Foot>
        <StudioFCount playback={playback} />
        <KkStudioFText
          text={text}
          emptyText={quietText}
          openLabel={STUDIO_F_OPEN_DESCRIPTION}
          turn={lesson.textTurn}
          onOpen={lesson.openSheet}
        />
        <KkStudioFLesson.Row>
          <KkStudioFSpeed
            label={STUDIO_F_SPEED_LABEL}
            options={RATE_OPTIONS}
            value={lesson.rateId}
            slowed={lesson.slowed}
            onChange={lesson.chooseRate}
          />
          <KkStudioFWhole
            label={STUDIO_F_WHOLE}
            checked={lesson.whole}
            disabled={noSteps}
            onToggle={lesson.toggleWhole}
          />
        </KkStudioFLesson.Row>
        <KkStudioFTransport
          playing={lesson.playing}
          playLabel={STUDIO_F_PLAY}
          pauseLabel={STUDIO_F_PAUSE}
          previousLabel={STUDIO_F_PREVIOUS}
          nextLabel={STUDIO_F_NEXT}
          canPlay={lesson.canPlay}
          canPrevious={lesson.canPrevious}
          canNext={lesson.canNext}
          onToggle={lesson.toggle}
          onPrevious={lesson.previous}
          onNext={lesson.next}
        />
      </KkStudioFLesson.Foot>
      <StudioFStepSheet lesson={lesson} />
    </KkStudioFLesson>
  );
};
