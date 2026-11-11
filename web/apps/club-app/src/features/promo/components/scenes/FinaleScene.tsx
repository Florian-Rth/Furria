import { KkConfettiRain } from '@furria/ui/KkConfettiRain';
import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { useReelBeat } from '../../hooks/use-reel-beat';
import { useSceneStart } from '../../hooks/use-scene-start';
import { FINALE_COPY, PROMO_QR_CALL } from '../../promo-copy';
import { HERO_QR, QR_DOCK } from '../../reel-placements';
import type { ReelSceneProps } from '../../reel-scene-props';

const DOCK_MS = 7150;
const WALL_HEIGHT = 330;
const RAIN_COUNT = 16;

export const FinaleScene: FC<ReelSceneProps> = ({
  phase,
  cut,
  wallNames,
  accessUrl,
  accessAddress,
}) => {
  const live = phase === 'live';
  const startMs = useSceneStart(live);
  const docking = useReelBeat(live, startMs, DOCK_MS);
  const dock = docking ? QR_DOCK : null;
  const rain = live ? <KkConfettiRain count={RAIN_COUNT} alwaysPlays /> : null;

  return (
    <KkPromoStage.Scene phase={phase} cut={cut}>
      {rain}
      <KkPromoStage.Copy top={110} width={720}>
        <KkPromoStage.Headline
          line1={FINALE_COPY.line1}
          line2={FINALE_COPY.line2}
          size="display"
          delay={0.2}
        />
        <KkPromoStage.Lead delay={0.6}>{FINALE_COPY.lead}</KkPromoStage.Lead>
        <KkPromoStage.NameWall names={wallNames} height={WALL_HEIGHT} delay={0.9} />
      </KkPromoStage.Copy>
      <KkPromoStage.Device
        centerX={HERO_QR.centerX}
        centerY={HERO_QR.centerY}
        tilt={0}
        turn={-10}
        entry="right"
        delay={0.5}
      >
        <KkPromoStage.QrCard
          value={accessUrl}
          call={PROMO_QR_CALL}
          address={accessAddress}
          size="hero"
          dock={dock}
        />
      </KkPromoStage.Device>
    </KkPromoStage.Scene>
  );
};
