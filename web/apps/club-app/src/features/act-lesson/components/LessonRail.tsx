import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { shownStepNameOf } from '@/features/act-player/step-names';
import { PRACTICE_SEGMENTS_LABEL } from '@/features/act-practice/practice-copy';
import type { Lesson } from '../hooks/use-lesson';
import { railGroupLabelOf, railStepLabelOf } from '../lesson-copy';
import { LessonRailFillLive } from './LessonRailFillLive';

interface LessonRailProps {
  lesson: Lesson;
}

export const LessonRail: FC<LessonRailProps> = ({ lesson }) => {
  const { practice, playback } = lesson.screen;
  const groups = lesson.rail.map((group) => {
    const steps = group.segments.map((segment) => {
      const name = shownStepNameOf(segment.step.name, segment.number);
      const jump = (): void => {
        practice.jumpTo(segment.stepId);
      };
      const fill = segment.current ? (
        <LessonRailFillLive player={playback.player} step={segment.step} />
      ) : null;

      return (
        <KkLesson.RailStep
          key={segment.stepId}
          number={segment.number}
          name={name}
          label={railStepLabelOf(name)}
          current={segment.current}
          looped={segment.looped}
          onPress={jump}
        >
          {fill}
        </KkLesson.RailStep>
      );
    });
    const { part } = group;
    const loopPart = (): void => {
      if (part !== null) {
        practice.loopPart(part.firstStepId);
      }
    };
    const partKey =
      part === null ? null : (
        <KkLesson.RailPart
          name={part.name}
          label={part.label}
          current={group.current}
          looped={part.looped}
          onPress={loopPart}
        />
      );

    return (
      <KkLesson.RailGroup key={group.key} label={railGroupLabelOf(part?.name ?? null)}>
        {partKey}
        {steps}
      </KkLesson.RailGroup>
    );
  });

  return <KkLesson.Rail label={PRACTICE_SEGMENTS_LABEL}>{groups}</KkLesson.Rail>;
};
