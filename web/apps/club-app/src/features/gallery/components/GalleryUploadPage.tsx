import { KkScreen } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GALLERY_ORIGIN } from '@/features/session';
import { UPLOAD_TITLE } from '../gallery-copy';
import { useGalleryUpload } from '../hooks/use-gallery-upload';
import { GalleryUploadCounter } from './GalleryUploadCounter';
import { GalleryUploadDropZone } from './GalleryUploadDropZone';
import { GalleryUploadScene } from './GalleryUploadScene';

export const GalleryUploadPage: FC = () => {
  const upload = useGalleryUpload();
  const scenes = upload.scenes.map((scene) => <GalleryUploadScene key={scene.id} scene={scene} />);

  return (
    <KkScreen
      kind="detail"
      title={UPLOAD_TITLE}
      origin={GALLERY_ORIGIN}
      thread={upload.thread}
      actions={upload.actions}
    >
      <Stack
        onDragEnter={upload.onDragEnter}
        onDragOver={upload.onDragOver}
        onDragLeave={upload.onDragLeave}
        onDrop={upload.onDrop}
        sx={{ rowGap: 2.5, pb: 4, minHeight: '70dvh' }}
      >
        <GalleryUploadCounter
          counter={upload.counter}
          statusLine={upload.statusLine}
          mood={upload.mood}
        />
        <GalleryUploadDropZone
          dragging={upload.dragging}
          roomy={upload.isEmpty}
          fileInput={upload.fileInput}
          folderInput={upload.folderInput}
          onPickFiles={upload.onPickFiles}
          onPickFolder={upload.onPickFolder}
          onPicked={upload.onPicked}
        />
        {scenes}
      </Stack>
    </KkScreen>
  );
};
