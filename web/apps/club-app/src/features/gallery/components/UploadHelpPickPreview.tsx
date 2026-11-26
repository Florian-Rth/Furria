import { KkButton } from '@furria/ui/KkButton';
import { KkDropZone } from '@furria/ui/KkDropZone';
import { KkFilmEdge } from '@furria/ui/KkFilmEdge';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DROP_LEAD, DROP_META, PICK_FILES_LABEL, PICK_FOLDER_LABEL } from '../upload/upload-copy';

const keep = (): void => {};

export const UploadHelpPickPreview: FC = () => (
  <KkDropZone active={false}>
    <KkFilmEdge lead={DROP_LEAD} meta={DROP_META} tone="ink" sprockets />
    <Stack direction="row" sx={{ columnGap: 1, flexWrap: 'wrap', rowGap: 1 }}>
      <KkButton size="small" variant="contained" onClick={keep}>
        {PICK_FOLDER_LABEL}
      </KkButton>
      <KkButton size="small" variant="outlined" onClick={keep}>
        {PICK_FILES_LABEL}
      </KkButton>
    </Stack>
  </KkDropZone>
);
