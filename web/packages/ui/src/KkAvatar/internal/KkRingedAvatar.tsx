import type { ElementType, FC } from 'react';
import type { KkImageSource } from '../../image-source';
import type { KkGroupTone } from '../../internal/group-tone';
import type { KkRingedAvatarSize } from '../../internal/honours/honour-metrics';
import type { KkHonours, KkStanding } from '../../internal/honours/honour-types';
import type { KkSx } from '../../kk-sx';
import { avatarMetrics } from './avatar-tier';
import { KkAvatarKit } from './KkAvatarKit';
import { SASH_KEY, useRingedAvatar } from './use-ringed-avatar';

const CENTER = 50;

interface KkRingedAvatarProps {
  initials: string;
  image?: KkImageSource | null;
  size: KkRingedAvatarSize;
  tone?: KkGroupTone;
  honours?: KkHonours;
  standing?: KkStanding;
  arrival: boolean;
  component?: ElementType;
  sx?: KkSx;
}

export const KkRingedAvatar: FC<KkRingedAvatarProps> = ({
  initials,
  image,
  size,
  tone,
  honours,
  standing,
  arrival,
  component,
  sx,
}) => {
  const view = useRingedAvatar(size, honours, standing, arrival);
  const { metrics, flag } = view;
  const plain = avatarMetrics[size];
  const center = metrics.box / 2;
  const sashOpen = flag.openKey === SASH_KEY;

  const toggleSash = (): void => {
    flag.toggle(SASH_KEY);
  };

  const standingRing =
    standing === undefined ? null : (
      <KkAvatarKit.Standing
        box={metrics.box}
        radius={metrics.standingRadius}
        stroke={metrics.standingStroke}
        membership={standing.membership}
        feeReduced={standing.feeReduced}
        arrive={view.arrive}
      />
    );
  const standingDot =
    standing === undefined || standing.app === 'none' ? null : (
      <KkAvatarKit.StandingDot
        box={metrics.box}
        faceRadius={view.faceRadius}
        dotRadius={metrics.dotRadius}
        app={standing.app}
      />
    );
  const sash =
    view.sash === null ? null : (
      <KkAvatarKit.Sash
        center={center}
        radius={view.faceRadius}
        mode={metrics.sash}
        entry={view.sash}
        clipId={view.clipId}
        arrive={view.arrive}
      />
    );
  const metal =
    honours === undefined ? null : (
      <KkAvatarKit.Metal
        box={metrics.box}
        radius={metrics.metalRadius}
        stroke={metrics.metalStroke}
        gap={metrics.pieceGap}
        lap={view.lap}
        bareTrack={view.bareTrack}
        prefix={view.prefix}
        play={view.play}
      />
    );
  const sashButton =
    view.sash === null || !metrics.interactive ? null : (
      <KkAvatarKit.Spot x={CENTER} y={CENTER} share={view.faceShare}>
        <KkAvatarKit.SashButton
          label={view.sash.label}
          open={sashOpen}
          onToggle={toggleSash}
          onClose={flag.close}
        />
      </KkAvatarKit.Spot>
    );
  const coins = view.coins.map(({ coin, spot, order }) => (
    <KkAvatarKit.Spot key={coin.key} x={spot.x} y={spot.y} share={metrics.coinShare}>
      <KkAvatarKit.Coin
        coin={coin}
        interactive={metrics.interactive}
        showIcon={metrics.interactive}
        order={order}
        arrive={view.arrive}
        open={flag.openKey === coin.key}
        onToggle={flag.toggle}
        onClose={flag.close}
      />
    </KkAvatarKit.Spot>
  ));

  return (
    <KkAvatarKit size={plain.size} component={component} sx={sx}>
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
        {standingRing}
        {sash}
        {standingDot}
        {metal}
      </KkAvatarKit.Canvas>
      {sashButton}
      {coins}
    </KkAvatarKit>
  );
};
