import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkScoreTrack } from '@furria/ui/KkScoreTrack';
import type { FC } from 'react';
import { ScorePlayhead } from '@/features/act-hub/components/ScorePlayhead';
import { WHOLE_ZOOM } from '@/features/act-hub/score-ruler';
import type { Lesson } from '../hooks/use-lesson';
import { LESSON_STRIP_LABEL } from '../lesson-copy';

const NO_LINES: readonly number[] = [];
const NO_REVEAL_SECONDS = 0;

interface LessonStripProps {
  lesson: Lesson;
  tone: KkGroupTone | null;
}

export const LessonStrip: FC<LessonStripProps> = ({ lesson, tone }) => {
  const { strip } = lesson;
  const { playback, practice } = lesson.screen;
  const current = practice.step?.stepId ?? null;

  return (
    <KkScoreTrack label={LESSON_STRIP_LABEL} size="slim" zoom={WHOLE_ZOOM} onSeek={strip.seek}>
      <KkScoreTrack.Parts tone={tone} parts={strip.parts} />
      <KkScoreTrack.Wave
        bars={strip.bars}
        seams={NO_LINES}
        eights={NO_LINES}
        reveal={false}
        revealSeconds={NO_REVEAL_SECONDS}
      />
      <KkScoreTrack.Ticks ticks={strip.ticks} activeKey={current} revealSeconds={null} />
      <ScorePlayhead
        player={playback.player}
        length={playback.length}
        bars={strip.bars}
        playing={practice.playing}
      />
    </KkScoreTrack>
  );
};
