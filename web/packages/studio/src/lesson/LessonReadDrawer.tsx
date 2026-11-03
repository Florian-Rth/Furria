import { LESSON_READ_CLOSE, LESSON_READ_LABEL } from '@furria/studio/lesson-copy';
import type { Lesson } from '@furria/studio/use-lesson';
import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';

interface LessonReadDrawerProps {
  lesson: Lesson;
}

export const LessonReadDrawer: FC<LessonReadDrawerProps> = ({ lesson }) => {
  const { card, reading } = lesson;

  return (
    <KkBottomDrawer
      open={reading.open}
      label={LESSON_READ_LABEL}
      closeLabel={LESSON_READ_CLOSE}
      onClose={reading.close}
    >
      <KkLesson.Read eyebrow={card.eyebrow} name={card.name} text={card.text} />
    </KkBottomDrawer>
  );
};
