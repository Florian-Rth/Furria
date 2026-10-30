import { KkKeyHelp } from '@furria/ui/KkKeyHelp';
import { KkKeyList } from '@furria/ui/KkKeyList';
import { KkLesson } from '@furria/ui/KkLesson';
import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioEdit } from '@furria/ui/KkStudioEdit';
import type { FC } from 'react';
import {
  PRACTICE_BACK,
  PRACTICE_FORWARD,
  PRACTICE_KEYS,
  PRACTICE_KEYS_TITLE,
} from '@/features/act-practice/practice-copy';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { STUDIO_DONE, STUDIO_EDIT } from '@/features/act-studio/studio-copy';
import { LESSON_DOCK_LABEL, LESSON_HALL, LESSON_HALL_LABEL } from '../lesson-copy';

interface LessonDockProps {
  screen: StudioScreen;
}

export const LessonDock: FC<LessonDockProps> = ({ screen }) => {
  const { practice, mode, startHall } = screen;
  const back = (): void => {
    practice.skip('back');
  };
  const forward = (): void => {
    practice.skip('forward');
  };
  const hall =
    startHall === null ? null : (
      <KkLesson.Hall text={LESSON_HALL} label={LESSON_HALL_LABEL} onOpen={startHall} />
    );
  const edit = mode.canEdit ? (
    <>
      <KkPracticeTransport.Divider />
      <KkStudioEdit
        editing={mode.editing}
        editLabel={STUDIO_EDIT}
        doneText={STUDIO_DONE}
        onToggle={mode.toggle}
      />
    </>
  ) : null;

  return (
    <KkLesson.Dock label={LESSON_DOCK_LABEL}>
      {hall}
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
        {edit}
      </KkPracticeTransport.Pill>
      <KkKeyHelp label={PRACTICE_KEYS_TITLE} opens="up">
        <KkKeyList title={PRACTICE_KEYS_TITLE} entries={PRACTICE_KEYS} />
      </KkKeyHelp>
    </KkLesson.Dock>
  );
};
