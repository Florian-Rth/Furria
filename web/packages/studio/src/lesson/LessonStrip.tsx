import { LESSON_STRIP_LABEL } from '@furria/studio/lesson-copy';
import { Timeline } from '@furria/studio/Timeline';
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
  const current = practice.step?.stepId ?? null;

  return (
    <Timeline
      label={LESSON_STRIP_LABEL}
      density="strip"
      length={playback.length}
      onSeek={strip.seek}
    >
      <Timeline.Parts tone={tone} parts={strip.parts} />
      <Timeline.Wave
        segments={playback.segments}
        peaks={playback.peaksByItem}
        player={playback.player}
        playing={practice.playing}
      />
      <Timeline.Ticks steps={strip.ticks} activeKey={current} />
      <Timeline.Playhead player={playback.player} playing={practice.playing} />
    </Timeline>
  );
};
