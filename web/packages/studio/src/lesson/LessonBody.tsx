import { LessonBeatLive } from '@furria/studio/LessonBeatLive';
import { LessonCountsLive } from '@furria/studio/LessonCountsLive';
import { LessonDock } from '@furria/studio/LessonDock';
import { LessonPicture } from '@furria/studio/LessonPicture';
import { LessonRail } from '@furria/studio/LessonRail';
import { LessonReadDrawer } from '@furria/studio/LessonReadDrawer';
import { LessonStrip } from '@furria/studio/LessonStrip';
import { LESSON_LABEL, LESSON_LOOP, LESSON_NEXT } from '@furria/studio/lesson-copy';
import type { LessonScreen } from '@furria/studio/lesson-screen';
import { useLesson } from '@furria/studio/use-lesson';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';

interface LessonBodyProps {
  title: string;
  tone: KkGroupTone | null;
  screen: LessonScreen;
}

export const LessonBody: FC<LessonBodyProps> = ({ title, tone, screen }) => {
  const lesson = useLesson(screen);
  const { card, loop, next } = lesson;
  const { playback, practice } = screen;

  return (
    <KkLesson label={LESSON_LABEL} title={title}>
      <KkLesson.Area name="strip">
        <LessonStrip lesson={lesson} tone={tone} />
      </KkLesson.Area>
      <KkLesson.Area name="card">
        <KkLesson.Card label={card.label}>
          <LessonPicture lesson={lesson} />
          <KkLesson.Part name="head">
            <KkLesson.Title fadeKey={card.key} eyebrow={card.eyebrow} name={card.name} />
            <LessonBeatLive
              player={playback.player}
              segments={playback.segments}
              counts={lesson.counts}
            />
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
        <LessonDock screen={screen} />
      </KkLesson.Area>
      <LessonReadDrawer lesson={lesson} />
    </KkLesson>
  );
};
