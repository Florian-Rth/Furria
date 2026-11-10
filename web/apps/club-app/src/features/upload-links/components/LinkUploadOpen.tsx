import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkFactLine } from '@furria/ui/KkFactLine';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextField } from '@furria/ui/KkTextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GalleryUploadCounter } from '@/features/gallery/components/GalleryUploadCounter';
import { GalleryUploadScene } from '@/features/gallery/components/GalleryUploadScene';
import { RETRY_ALL_LABEL } from '@/features/gallery/upload/upload-copy';
import { UPLOAD_ACCEPT } from '@/features/gallery/upload/upload-queue';
import type { LinkUploadPage } from '../hooks/use-link-upload-page';
import {
  KEEP_OPEN_NOTE,
  NAME_FIELD,
  PAGE_OPEN_UNTIL,
  PAGE_TITLE,
  PICK_LABEL,
  PICK_MORE_LABEL,
  PRIVACY_NOTE,
} from '../upload-link-copy';

const UPLOADER_NAME_LENGTH = 60;

interface LinkUploadOpenProps {
  page: LinkUploadPage;
}

export const LinkUploadOpen: FC<LinkUploadOpenProps> = ({ page }) => {
  const pickLabel = page.hasUploads ? PICK_MORE_LABEL : PICK_LABEL;
  const pickVariant = page.hasUploads ? 'outlined' : 'contained';
  const scenes = page.scenes.map((scene) => <GalleryUploadScene key={scene.id} scene={scene} />);
  const progress = page.hasUploads ? (
    <Stack sx={{ rowGap: 0.5 }}>
      <GalleryUploadCounter counter={page.counter} statusLine={page.statusLine} mood={page.mood} />
      <KkNote tone="hint">{KEEP_OPEN_NOTE}</KkNote>
    </Stack>
  ) : null;
  const retry = page.hasFailures ? (
    <KkButton variant="outlined" onClick={page.onRetryFailed}>
      {RETRY_ALL_LABEL}
    </KkButton>
  ) : null;

  return (
    <Stack sx={{ rowGap: 2.5, minWidth: 0 }}>
      <Stack sx={{ rowGap: 1 }}>
        <KkEyebrow tone="accent">{PAGE_TITLE}</KkEyebrow>
        <KkHeading level={1} component="h1">
          {page.title}
        </KkHeading>
        <KkFactLine label={PAGE_OPEN_UNTIL} value={page.openUntil} />
      </Stack>
      <KkTextField
        name="uploader-name"
        label={NAME_FIELD}
        autoComplete="name"
        maxLength={UPLOADER_NAME_LENGTH}
        value={page.name}
        onChange={page.onName}
      />
      <KkButton variant={pickVariant} size="large" fullWidth onClick={page.onPick}>
        {pickLabel}
      </KkButton>
      <Box
        component="input"
        type="file"
        multiple
        accept={UPLOAD_ACCEPT}
        ref={page.fileInput}
        onChange={page.onPicked}
        hidden
      />
      {progress}
      {retry}
      {scenes}
      <KkNote icon="lock">{PRIVACY_NOTE}</KkNote>
    </Stack>
  );
};
