import { KkButton } from '@furria/ui/KkButton';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  ROTATE_LEFT_LABEL,
  ROTATE_LEFT_SHORT,
  ROTATE_RIGHT_LABEL,
  ROTATE_RIGHT_SHORT,
  ROTATION_FIELD_LABEL,
  toRotationValue,
} from '../table-planner-copy';

const STEP = 15;

interface TablePlannerRotateFieldProps {
  rotation: number | null;
  onRotate: (degrees: number) => void;
}

export const TablePlannerRotateField: FC<TablePlannerRotateFieldProps> = ({
  rotation,
  onRotate,
}) => {
  const left = (): void => {
    onRotate(-STEP);
  };
  const right = (): void => {
    onRotate(STEP);
  };
  const current = rotation === null ? null : toRotationValue(rotation);
  const value = (
    <Stack direction="row" sx={{ alignItems: 'center', columnGap: 1 }}>
      <KkButton size="small" variant="outlined" onClick={left} ariaLabel={ROTATE_LEFT_LABEL}>
        {ROTATE_LEFT_SHORT}
      </KkButton>
      <KkButton size="small" variant="outlined" onClick={right} ariaLabel={ROTATE_RIGHT_LABEL}>
        {ROTATE_RIGHT_SHORT}
      </KkButton>
      {current}
    </Stack>
  );

  return <KkFieldRow label={ROTATION_FIELD_LABEL} value={value} />;
};
