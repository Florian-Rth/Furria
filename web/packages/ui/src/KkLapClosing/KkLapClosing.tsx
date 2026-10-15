import type { FC } from 'react';
import type { KkImageSource } from '../image-source';
import type { KkGroupTone } from '../internal/group-tone';
import type { KkHonours } from '../internal/honours/honour-types';
import { avatarMetrics } from '../KkAvatar/internal/avatar-tier';
import { KkAvatarKit } from '../KkAvatar/internal/KkAvatarKit';
import type { KkSx } from '../kk-sx';
import { useLapClosing } from './internal/use-lap-closing';

type KkLapClosingSize = 'header' | 'portrait';

interface KkLapClosingProps {
  initials: string;
  image?: KkImageSource | null;
  tone?: KkGroupTone;
  honours: KkHonours;
  size?: KkLapClosingSize;
  sx?: KkSx;
}

const NO_FLAG = (): void => {};

export const KkLapClosing: FC<KkLapClosingProps> = ({
  initials,
  image,
  tone,
  honours,
  size = 'portrait',
  sx,
}) => {
  const view = useLapClosing(size, honours);
  const { metrics } = view;
  const plain = avatarMetrics[size];
  const center = metrics.box / 2;

  const sash =
    view.sash === null ? null : (
      <KkAvatarKit.Sash
        center={center}
        radius={metrics.faceRadius}
        mode={metrics.sash}
        entry={view.sash}
        clipId={view.clipId}
        arrive={false}
      />
    );
  const chips = view.chips.map((chip) => (
    <KkAvatarKit.ForgeChip
      key={chip.key}
      chip={chip}
      center={center}
      size={view.chipSize}
      gradient={view.gradient}
    />
  ));
  const coins = view.coins.map(({ coin, spot }, order) => (
    <KkAvatarKit.Spot key={coin.key} x={spot.x} y={spot.y} share={metrics.coinShare}>
      <KkAvatarKit.Coin
        coin={coin}
        interactive={false}
        showIcon={metrics.interactive}
        order={order}
        arrive={false}
        open={false}
        onToggle={NO_FLAG}
        onClose={NO_FLAG}
      />
    </KkAvatarKit.Spot>
  ));

  return (
    <KkAvatarKit size={plain.size} sx={sx}>
      <KkAvatarKit.Face
        initials={initials}
        image={image}
        extent={view.faceExtent}
        imageSizes={plain.size}
        typography={plain.typography}
        tone={tone}
        component="span"
      />
      <KkAvatarKit.Canvas box={metrics.box} label={view.label}>
        <KkAvatarKit.MetalDefs prefix={view.prefix} />
        {sash}
        <KkAvatarKit.Metal
          box={metrics.box}
          radius={metrics.metalRadius}
          stroke={metrics.metalStroke}
          gap={metrics.pieceGap}
          lap={view.lap}
          bareTrack={false}
          prefix={view.prefix}
          play={view.play}
        />
        {chips}
      </KkAvatarKit.Canvas>
      {coins}
    </KkAvatarKit>
  );
};
