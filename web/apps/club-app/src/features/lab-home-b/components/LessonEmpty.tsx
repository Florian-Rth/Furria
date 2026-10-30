import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import {
  LESSON_EMPTY_EYEBROW,
  LESSON_EMPTY_NAME,
  LESSON_EMPTY_PICTURE,
  LESSON_EMPTY_TEXT,
  LESSON_LABEL,
  LESSON_PICTURE_LABEL,
} from '../lesson-copy';

const EMPTY_KEY = 'empty';

interface LessonEmptyProps {
  title: string;
}

export const LessonEmpty: FC<LessonEmptyProps> = ({ title }) => (
  <KkLesson label={LESSON_LABEL} title={title}>
    <KkLesson.Area name="card">
      <KkLesson.Card label={LESSON_EMPTY_NAME}>
        <KkLesson.Picture label={LESSON_PICTURE_LABEL}>
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
  </KkLesson>
);
