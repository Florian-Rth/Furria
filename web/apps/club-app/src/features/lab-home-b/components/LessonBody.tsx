import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useLesson } from '../hooks/use-lesson';
import { LESSON_LABEL, LESSON_LOOP, LESSON_NEXT } from '../lesson-copy';
import { LessonBeatLive } from './LessonBeatLive';
import { LessonCountsLive } from './LessonCountsLive';
import { LessonCueLive } from './LessonCueLive';
import { LessonDock } from './LessonDock';
import { LessonPicture } from './LessonPicture';
import { LessonRail } from './LessonRail';
import { LessonReadDrawer } from './LessonReadDrawer';

interface LessonBodyProps {
  actId: number;
  title: string;
  studio: Studio;
  viewerId: number | null;
  onHall: () => void;
}

export const LessonBody: FC<LessonBodyProps> = ({ actId, title, studio, viewerId, onHall }) => {
  const lesson = useLesson(actId, studio, viewerId);
  const { card, playback, practice, loop, next } = lesson;

  return (
    <KkLesson label={LESSON_LABEL} title={title}>
      <KkLesson.Area name="card">
        <KkLesson.Card label={card.label}>
          <LessonPicture lesson={lesson} />
          <KkLesson.Part name="head">
            <KkLesson.Title fadeKey={card.key} eyebrow={card.eyebrow} name={card.name} />
            <LessonCueLive
              player={playback.player}
              ownPath={lesson.ownPath}
              marks={playback.countMarks}
              loop={practice.loop}
            />
            <LessonBeatLive player={playback.player} segments={playback.segments} />
          </KkLesson.Part>
          <KkLesson.Part name="counts">
            <LessonCountsLive
              player={playback.player}
              step={practice.step}
              counts={lesson.counts}
            />
            <KkLesson.Loop
              text={LESSON_LOOP}
              label={loop.label}
              pressed={loop.pressed}
              disabled={!practice.canStep}
              onToggle={loop.toggle}
            />
          </KkLesson.Part>
          <KkLesson.Part name="text">
            <KkLesson.Text
              fadeKey={card.key}
              text={card.text}
              muted={card.muted}
              onRead={lesson.reading.show}
            />
          </KkLesson.Part>
          <KkLesson.Part name="next">
            <KkLesson.Next
              fadeKey={card.key}
              eyebrow={LESSON_NEXT}
              number={next.number}
              name={next.name}
              label={next.label}
              onPress={next.jump}
            />
          </KkLesson.Part>
        </KkLesson.Card>
      </KkLesson.Area>
      <KkLesson.Area name="rail">
        <LessonRail lesson={lesson} />
      </KkLesson.Area>
      <KkLesson.Area name="dock">
        <LessonDock practice={practice} onHall={onHall} />
      </KkLesson.Area>
      <LessonReadDrawer lesson={lesson} />
    </KkLesson>
  );
};
