import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkBannerDesk } from '@furria/ui/KkBannerDesk';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkSx } from '@furria/ui/kk-sx';
import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import type { PictureSectionDesk } from '../hooks/use-picture-section';
import { PICTURE_COPY, PICTURE_DESK_LABELS } from '../picture-labels';
import { PICTURE_ACCEPT, PICTURE_ASPECTS, PICTURE_DESK_IDS } from '../picture-target';

interface PictureSectionProps {
  desk: PictureSectionDesk;
  placeholderLabel?: string;
  tone?: KkGroupTone;
  alt: string;
  title?: string;
  stampLabel?: string | null;
  children?: ReactNode;
  sx?: KkSx;
}

export const PictureSection: FC<PictureSectionProps> = ({
  desk,
  placeholderLabel,
  tone,
  alt,
  title,
  stampLabel = null,
  children,
  sx,
}) => {
  const { banner, kind } = desk;
  const copy = PICTURE_COPY[kind];

  return (
    <KkPanelSection title={title ?? copy.title} sx={sx}>
      <KkBannerDesk
        id={PICTURE_DESK_IDS[kind]}
        aspect={PICTURE_ASPECTS[kind]}
        guide={copy.guide}
        state={banner.state}
        placeholderLabel={placeholderLabel}
        tone={tone}
        stampLabel={stampLabel}
        source={banner.source}
        uncroppedSource={banner.uncroppedSource}
        crop={banner.crop}
        progress={banner.progress}
        alt={alt}
        readOnly={false}
        labels={PICTURE_DESK_LABELS[kind]}
        actions={desk.actions}
      />
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={desk.fileInputRef}
        onChange={desk.onFileChosen}
        hidden
      />
      {children}
    </KkPanelSection>
  );
};
