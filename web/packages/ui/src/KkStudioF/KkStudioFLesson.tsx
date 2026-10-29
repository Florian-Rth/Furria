import { KkStudioFLessonFoot } from './internal/layout/KkStudioFLessonFoot';
import { KkStudioFLessonHead } from './internal/layout/KkStudioFLessonHead';
import { KkStudioFLessonMedia } from './internal/layout/KkStudioFLessonMedia';
import { KkStudioFLessonRoot } from './internal/layout/KkStudioFLessonRoot';
import { KkStudioFLessonRow } from './internal/layout/KkStudioFLessonRow';

export const KkStudioFLesson = Object.assign(KkStudioFLessonRoot, {
  Head: KkStudioFLessonHead,
  Media: KkStudioFLessonMedia,
  Foot: KkStudioFLessonFoot,
  Row: KkStudioFLessonRow,
});
