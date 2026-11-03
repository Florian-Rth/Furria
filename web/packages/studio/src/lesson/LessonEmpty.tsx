import {
  LESSON_DOCK_LABEL,
  LESSON_EMPTY_EYEBROW,
  LESSON_EMPTY_NAME,
  LESSON_EMPTY_PICTURE,
  LESSON_EMPTY_TEXT,
  LESSON_LABEL,
  LESSON_PICTURE_LABEL,
} from '@furria/studio/lesson-copy';
import type { LessonEditSwitch } from '@furria/studio/lesson-screen';
import { STUDIO_DONE, STUDIO_EDIT } from '@furria/studio/studio-mode-copy';
import { KkLesson } from '@furria/ui/KkLesson';
import { KkStudioEdit } from '@furria/ui/KkStudioEdit';
import type { FC } from 'react';

const EMPTY_KEY = 'empty';

interface LessonEmptyProps {
  title: string;
  mode: LessonEditSwitch;
}

export const LessonEmpty: FC<LessonEmptyProps> = ({ title, mode }) => {
  const dock = mode.canEdit ? (
    <KkLesson.Area name="dock">
      <KkLesson.Dock label={LESSON_DOCK_LABEL}>
        <KkStudioEdit
          editing={mode.editing}
          editLabel={STUDIO_EDIT}
          doneText={STUDIO_DONE}
          onToggle={mode.toggle}
        />
      </KkLesson.Dock>
    </KkLesson.Area>
  ) : null;

  return (
    <KkLesson label={LESSON_LABEL} title={title}>
      <KkLesson.Area name="strip">
        <KkLesson.Heading text={title} />
      </KkLesson.Area>
      <KkLesson.Area name="card">
        <KkLesson.Card label={LESSON_EMPTY_NAME}>
          <KkLesson.Picture label={LESSON_PICTURE_LABEL} paired={false}>
            <KkLesson.Layer place="main" aspect={1} tone="ink">
              <KkLesson.Quiet text={LESSON_EMPTY_PICTURE} />
            </KkLesson.Layer>
          </KkLesson.Picture>
          <KkLesson.Part name="head">
            <KkLesson.Title
              fadeKey={EMPTY_KEY}
              eyebrow={LESSON_EMPTY_EYEBROW}
              name={LESSON_EMPTY_NAME}
            />
          </KkLesson.Part>
          <KkLesson.Part name="text">
            <KkLesson.Text fadeKey={EMPTY_KEY} text={LESSON_EMPTY_TEXT} muted />
          </KkLesson.Part>
        </KkLesson.Card>
      </KkLesson.Area>
      {dock}
    </KkLesson>
  );
};
