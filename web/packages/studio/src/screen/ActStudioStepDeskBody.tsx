import { ActStudioPartDesk } from '@furria/studio/ActStudioPartDesk';
import {
  STUDIO_PART_OPEN,
  STUDIO_STEP,
  STUDIO_STEP_DESK,
  STUDIO_STEP_REMOVE,
  STUDIO_STEP_REMOVE_SURE,
} from '@furria/studio/studio-copy';
import type { StepDesk } from '@furria/studio/use-step-desk';
import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC } from 'react';

interface ActStudioStepDeskBodyProps {
  desk: StepDesk;
}

export const ActStudioStepDeskBody: FC<ActStudioStepDeskBodyProps> = ({ desk }) => {
  const removeText = desk.removing ? STUDIO_STEP_REMOVE_SURE : STUDIO_STEP_REMOVE;
  const opener = desk.canOpenPart ? (
    <KkButton variant="outlined" size="small" onClick={desk.openPart}>
      {STUDIO_PART_OPEN}
    </KkButton>
  ) : null;
  const part = desk.part === null ? null : <ActStudioPartDesk part={desk.part} />;

  return (
    <KkStudioDesk label={STUDIO_STEP_DESK}>
      <KkStudioDesk.Line>
        <KkStudioDesk.Title text={STUDIO_STEP} />
        <KkStudioDesk.Controls>
          {opener}
          <KkButton variant="outlined" tone="danger" size="small" onClick={desk.remove}>
            {removeText}
          </KkButton>
        </KkStudioDesk.Controls>
      </KkStudioDesk.Line>
      {part}
    </KkStudioDesk>
  );
};
