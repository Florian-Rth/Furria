import { Timeline } from '@furria/studio/Timeline';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';
import type { Lesson } from '../hooks/use-lesson';
import { LESSON_STRIP_LABEL } from '../lesson-copy';

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
