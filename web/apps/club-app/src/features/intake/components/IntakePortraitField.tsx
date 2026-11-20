import { KkBannerDesk } from '@furria/ui/KkBannerDesk';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkNote } from '@furria/ui/KkNote';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { PICTURE_ACCEPT } from '@/features/pictures/picture-target';
import type { PortraitPickControl } from '../hooks/use-portrait-pick';
import {
  PORTRAIT_ALT,
  PORTRAIT_DESK_ID,
  PORTRAIT_LABELS,
  PORTRAIT_SECTION,
  UNPREVIEWABLE_LINE,
  uploadLineOf,
} from '../intake-copy';

interface IntakePortraitFieldProps {
  portrait: PortraitPickControl;
  uploadShare: number | null;
}

export const IntakePortraitField: FC<IntakePortraitFieldProps> = ({ portrait, uploadShare }) => {
  const { banner } = portrait;
  const uploadText = uploadShare === null ? null : uploadLineOf(uploadShare);
  const uploadLine = uploadText === null ? null : <KkNote>{uploadText}</KkNote>;
  const isUnpreviewable = banner.state === 'ready' && banner.preview === null;
  const unpreviewableLine = isUnpreviewable ? <KkNote>{UNPREVIEWABLE_LINE}</KkNote> : null;

  return (
    <KkFormSection title={PORTRAIT_SECTION}>
      <KkBannerDesk
        id={PORTRAIT_DESK_ID}
        aspect="portrait"
        guide="circle"
        state={banner.state}
        preview={banner.preview}
        source={null}
        uncroppedSource={banner.uncroppedSource}
        crop={banner.crop}
        progress={0}
        alt={PORTRAIT_ALT}
        readOnly={false}
        labels={PORTRAIT_LABELS}
        actions={portrait.actions}
      />
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={portrait.fileInputRef}
        onChange={portrait.onFileChosen}
        hidden
      />
      {unpreviewableLine}
      {uploadLine}
    </KkFormSection>
  );
};
