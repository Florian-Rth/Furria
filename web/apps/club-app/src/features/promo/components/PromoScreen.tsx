import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { ReelClockContext } from '../hooks/reel-clock-context';
import { useProjectorMode } from '../hooks/use-projector-mode';
import { usePromoReel } from '../hooks/use-promo-reel';
import {
  PROMO_ARRIVAL_LABELS,
  PROMO_CLUB_NAME,
  PROMO_INDEX,
  PROMO_LABEL,
  PROMO_QR_CALL,
  PROMO_WORDMARK,
  sessionMetaOf,
} from '../promo-copy';
import { PromoSceneSlot } from './PromoSceneSlot';

export const PromoScreen: FC = () => {
  const reel = usePromoReel();
  const enterFullscreen = useProjectorMode();
  const meta = [PROMO_CLUB_NAME, sessionMetaOf(reel.yearsLabel)];

  return (
    <ReelClockContext.Provider value={reel.clock}>
      <KkPromoStage label={PROMO_LABEL} onPress={enterFullscreen}>
        <KkPromoStage.Masthead wordmark={PROMO_WORDMARK} meta={meta} />
        {reel.slots.map((slot) => (
          <PromoSceneSlot
            key={slot.scene.key}
            sceneKey={slot.scene.key}
            phase={slot.phase}
            cut={slot.cut}
            wallNames={reel.wallNames}
            accessUrl={reel.accessUrl}
            accessAddress={reel.accessAddress}
            yearsLabel={reel.yearsLabel}
          />
        ))}
        <KkPromoStage.Index items={PROMO_INDEX} active={reel.indexActive} />
        <KkPromoStage.Corner>
          <KkPromoStage.QrCard
            value={reel.accessUrl}
            call={PROMO_QR_CALL}
            address={reel.accessAddress}
            shown={reel.cornerShown}
          />
        </KkPromoStage.Corner>
        <KkPromoStage.Foot>
          <KkPromoStage.Ticker items={reel.tickerItems} />
        </KkPromoStage.Foot>
        <KkPromoStage.Arrivals arrival={reel.arrival} labels={PROMO_ARRIVAL_LABELS} />
      </KkPromoStage>
    </ReelClockContext.Provider>
  );
};
