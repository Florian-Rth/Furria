import { KkButton } from '@furria/ui/KkButton';
import { KkStudioDesk } from '@furria/ui/KkStudioDesk';
import type { FC } from 'react';
import type { StepDesk } from '../hooks/use-step-desk';
import {
  STUDIO_PART_OPEN,
  STUDIO_STEP,
  STUDIO_STEP_DESK,
  STUDIO_STEP_REMOVE,
  STUDIO_STEP_REMOVE_SURE,
} from '../studio-copy';
import { ActStudioPartDesk } from './ActStudioPartDesk';

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
