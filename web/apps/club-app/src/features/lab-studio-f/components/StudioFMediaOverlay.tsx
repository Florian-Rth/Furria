import { KkStudioFMirror } from '@furria/ui/KkStudioFMirror';
import { KkStudioFViewToggle } from '@furria/ui/KkStudioFViewToggle';
import type { FC } from 'react';
import type { StudioFLesson } from '../hooks/use-studio-f-lesson';
import {
  STUDIO_F_MIRRORED,
  STUDIO_F_VIEW_LABEL,
  STUDIO_F_VIEW_STAGE,
  STUDIO_F_VIEW_VIDEO,
} from '../studio-f-copy';

interface StudioFMediaOverlayProps {
  lesson: StudioFLesson;
}

export const StudioFMediaOverlay: FC<StudioFMediaOverlayProps> = ({ lesson }) => {
  const options = [
    { id: 'video', label: STUDIO_F_VIEW_VIDEO, disabled: lesson.video === null },
    { id: 'stage', label: STUDIO_F_VIEW_STAGE, disabled: false },
  ] as const;

  return (
    <>
      <KkStudioFViewToggle
        label={STUDIO_F_VIEW_LABEL}
        value={lesson.view}
        options={options}
        onChange={lesson.chooseView}
      />
      <KkStudioFMirror
        label={STUDIO_F_MIRRORED}
        pressed={lesson.mirrored}
        onToggle={lesson.toggleMirror}
      />
    </>
  );
};
