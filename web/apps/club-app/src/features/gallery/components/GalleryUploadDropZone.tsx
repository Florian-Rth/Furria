import { KkButton, KkDropZone, KkFilmEdge } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, RefCallback } from 'react';
import {
  DROP_ACTIVE_LEAD,
  DROP_LEAD,
  DROP_META,
  PICK_FILES_LABEL,
  PICK_FOLDER_LABEL,
} from '../upload/upload-copy';
import { UPLOAD_ACCEPT } from '../upload/upload-queue';

interface GalleryUploadDropZoneProps {
  dragging: boolean;
  roomy: boolean;
  fileInput: RefCallback<HTMLInputElement>;
  folderInput: RefCallback<HTMLInputElement>;
  onPickFiles: () => void;
  onPickFolder: () => void;
  onPicked: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const GalleryUploadDropZone: FC<GalleryUploadDropZoneProps> = ({
  dragging,
  roomy,
  fileInput,
  folderInput,
  onPickFiles,
  onPickFolder,
  onPicked,
}) => {
  const lead = dragging ? DROP_ACTIVE_LEAD : DROP_LEAD;
  const edgeTone = dragging ? 'gold' : 'ink';

  return (
    <KkDropZone active={dragging} roomy={roomy}>
      <KkFilmEdge lead={lead} meta={DROP_META} tone={edgeTone} sprockets />
      <Stack direction="row" sx={{ columnGap: 1, flexWrap: 'wrap', rowGap: 1 }}>
        <KkButton size="small" variant="contained" onClick={onPickFolder}>
          {PICK_FOLDER_LABEL}
        </KkButton>
        <KkButton size="small" variant="outlined" onClick={onPickFiles}>
          {PICK_FILES_LABEL}
        </KkButton>
      </Stack>
      <Box
        component="input"
        type="file"
        multiple
        accept={UPLOAD_ACCEPT}
        ref={fileInput}
        onChange={onPicked}
        hidden
      />
      <Box component="input" type="file" multiple ref={folderInput} onChange={onPicked} hidden />
    </KkDropZone>
  );
};
