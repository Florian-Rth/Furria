import { LESSON_STRIP_LABEL } from '@furria/studio/lesson-copy';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import type { Lesson } from '@furria/studio/use-lesson';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';

interface LessonStripProps {
  lesson: Lesson;
  tone: KkGroupTone | null;
}

export const LessonStrip: FC<LessonStripProps> = ({ lesson, tone }) => {
  const { strip } = lesson;
  const { playback, practice } = lesson.screen;
  const parts = { parts: strip.parts, tone };
  const wave = { segments: playback.segments, peaks: playback.peaksByItem };
  const steps = { steps: strip.steps, activeKey: practice.step?.stepId ?? null };

  return (
    <StudioTimeline
      label={LESSON_STRIP_LABEL}
      density="strip"
      length={playback.length}
      centre={strip.centre}
      parts={parts}
      wave={wave}
      steps={steps}
    />
  );
};
