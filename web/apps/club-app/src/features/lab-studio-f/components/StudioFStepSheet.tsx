import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkStudioFStepSheet } from '@furria/ui/KkStudioFStepSheet';
import type { FC } from 'react';
import type { StudioFLesson } from '../hooks/use-studio-f-lesson';
import { STUDIO_F_SHEET_CLOSE, STUDIO_F_SHEET_LABEL } from '../studio-f-copy';

interface StudioFStepSheetProps {
  lesson: StudioFLesson;
}

export const StudioFStepSheet: FC<StudioFStepSheetProps> = ({ lesson }) => {
  const { step } = lesson;
  const open = lesson.sheetOpen && step !== null && step.description !== null;
  const content =
    step === null || step.description === null ? null : (
      <KkStudioFStepSheet
        number={lesson.number}
        name={step.name}
        part={lesson.partName}
        description={step.description}
      />
    );

  return (
    <KkBottomDrawer
      open={open}
      label={STUDIO_F_SHEET_LABEL}
      closeLabel={STUDIO_F_SHEET_CLOSE}
      onClose={lesson.closeSheet}
    >
      {content}
    </KkBottomDrawer>
  );
};
