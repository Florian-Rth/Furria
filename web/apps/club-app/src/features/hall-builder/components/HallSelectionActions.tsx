import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  DELETE_LABEL,
  DUPLICATE_LABEL,
  ROTATE_LEFT_LABEL,
  ROTATE_RIGHT_LABEL,
} from '../hall-builder-copy';

const COPY_ICON = <KkIcon name="copy" size="small" />;
const ROTATE_ICON = <KkIcon name="rotate" size="small" />;
const DELETE_ICON = <KkIcon name="delete" size="small" />;

export const HallSelectionActions: FC = () => {
  const builder = useHallBuilderContext();

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      <KkButton
        variant="outlined"
        size="small"
        startIcon={ROTATE_ICON}
        onClick={builder.rotateLeft}
      >
        {ROTATE_LEFT_LABEL}
      </KkButton>
      <KkButton
        variant="outlined"
        size="small"
        startIcon={ROTATE_ICON}
        onClick={builder.rotateRight}
      >
        {ROTATE_RIGHT_LABEL}
      </KkButton>
      <KkButton
        variant="outlined"
        size="small"
        startIcon={COPY_ICON}
        onClick={builder.duplicateSelection}
      >
        {DUPLICATE_LABEL}
      </KkButton>
      <KkButton
        variant="outlined"
        size="small"
        tone="danger"
        startIcon={DELETE_ICON}
        onClick={builder.deleteSelection}
      >
        {DELETE_LABEL}
      </KkButton>
    </Stack>
  );
};
