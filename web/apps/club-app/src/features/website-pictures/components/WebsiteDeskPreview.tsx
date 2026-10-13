import { KkCropFrame, KkFrame } from '@furria/ui';
import type { FC } from 'react';
import type { PositionDesk } from '../hooks/use-position-desk';
import type { BoardPosition } from '../website-board';
import { CROP_LABELS, positionLabelOf } from '../website-copy';
import { deskFrameOf } from '../website-frames';

interface WebsiteDeskPreviewProps {
  position: BoardPosition;
  desk: PositionDesk;
}

export const WebsiteDeskPreview: FC<WebsiteDeskPreviewProps> = ({ position, desk }) => {
  const label = positionLabelOf(
    position.slotTitle,
    position.position,
    position.count,
    position.aspect,
    position.status,
  );
  const alt = position.picture?.alt ?? label;

  if (desk.cropSource !== null) {
    return (
      <KkCropFrame
        key={desk.cropSource}
        source={desk.cropSource}
        alt={alt}
        aspect={position.aspect}
        initialCrop={desk.initialCrop}
        labels={CROP_LABELS}
        onCropChange={desk.setCrop}
        onUnreadable={desk.unreadable}
      />
    );
  }

  const frame = deskFrameOf(position, desk);

  return (
    <KkFrame
      label={label}
      source={frame.source}
      state={frame.state}
      progress={desk.uploadShare}
      mark={frame.mark}
      aspect={position.aspect}
      placeholder
    />
  );
};
