import { LESSON_DOCK_LABEL, LESSON_HALL_LABEL } from '@furria/studio/lesson-copy';
import type { LessonScreen } from '@furria/studio/lesson-screen';
import {
  PRACTICE_BACK,
  PRACTICE_FORWARD,
  PRACTICE_KEYS,
  PRACTICE_KEYS_TITLE,
} from '@furria/studio/practice-copy';
import { STUDIO_DONE, STUDIO_EDIT } from '@furria/studio/studio-mode-copy';
import { KkKeyHelp } from '@furria/ui/KkKeyHelp';
import { KkKeyList } from '@furria/ui/KkKeyList';
import { KkLesson } from '@furria/ui/KkLesson';
import { KkPracticeTransport } from '@furria/ui/KkPracticeTransport';
import { KkStudioEdit } from '@furria/ui/KkStudioEdit';
import type { FC } from 'react';

interface LessonDockProps {
  screen: LessonScreen;
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
    startHall === null ? null : <KkLesson.Hall label={LESSON_HALL_LABEL} onOpen={startHall} />;
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
      {hall}
      <KkKeyHelp label={PRACTICE_KEYS_TITLE} opens="up">
        <KkKeyList title={PRACTICE_KEYS_TITLE} entries={PRACTICE_KEYS} />
      </KkKeyHelp>
    </KkLesson.Dock>
  );
};
