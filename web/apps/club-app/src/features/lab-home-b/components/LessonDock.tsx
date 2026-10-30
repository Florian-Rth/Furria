import { KkLesson } from '@furria/ui/KkLesson';
import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import type { FC } from 'react';
import type { Practice } from '@/features/act-practice/hooks/use-practice';
import { PRACTICE_BACK, PRACTICE_FORWARD } from '@/features/act-practice/practice-copy';
import { HOME_HALL, HOME_HALL_LABEL } from '@/features/lab-home/home-copy';
import { LESSON_DOCK_LABEL } from '../lesson-copy';

interface LessonDockProps {
  practice: Practice;
  onHall: () => void;
}

export const LessonDock: FC<LessonDockProps> = ({ practice, onHall }) => {
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };

  return (
    <KkLesson.Dock label={LESSON_DOCK_LABEL}>
      <KkLesson.Hall text={HOME_HALL} label={HOME_HALL_LABEL} onOpen={onHall} />
      <KkPracticeTransport.Pill>
        <KkPracticeTransport.Skip
          direction="back"
          label={PRACTICE_BACK}
          disabled={!practice.canStep}
          onSkip={back}
        />
        <KkPracticeTransport.Play
          playing={practice.playing}
          label={practice.playLabel}
          disabled={!practice.canPlay}
          onToggle={practice.toggle}
        />
        <KkPracticeTransport.Skip
          direction="forward"
          label={PRACTICE_FORWARD}
          disabled={!practice.canStep}
          onSkip={forward}
        />
      </KkPracticeTransport.Pill>
      <KkPracticeTransport.Pill>
        <KkPracticeTransport.Rate
          text={practice.rateText}
          label={practice.rateLabel}
          slowed={practice.slowed}
          onPress={practice.slowDown}
        />
      </KkPracticeTransport.Pill>
    </KkLesson.Dock>
  );
};
