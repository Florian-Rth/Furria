import { KkPromoStageCopy } from './internal/layout/KkPromoStageCopy';
import { KkPromoStageCorner } from './internal/layout/KkPromoStageCorner';
import { KkPromoStageDevice } from './internal/layout/KkPromoStageDevice';
import { KkPromoStageFoot } from './internal/layout/KkPromoStageFoot';
import { KkPromoStageRoot } from './internal/layout/KkPromoStageRoot';
import { KkPromoStageScene } from './internal/layout/KkPromoStageScene';
import { KkPromoStageArrivals } from './internal/ui/KkPromoStageArrivals';
import { KkPromoStageBrowser } from './internal/ui/KkPromoStageBrowser';
import { KkPromoStageCrest } from './internal/ui/KkPromoStageCrest';
import { KkPromoStageHeadline } from './internal/ui/KkPromoStageHeadline';
import { KkPromoStageIndex } from './internal/ui/KkPromoStageIndex';
import { KkPromoStageKicker } from './internal/ui/KkPromoStageKicker';
import { KkPromoStageLead } from './internal/ui/KkPromoStageLead';
import { KkPromoStageMasthead } from './internal/ui/KkPromoStageMasthead';
import { KkPromoStageNameWall } from './internal/ui/KkPromoStageNameWall';
import { KkPromoStagePhone } from './internal/ui/KkPromoStagePhone';
import { KkPromoStagePhotoWall } from './internal/ui/KkPromoStagePhotoWall';
import { KkPromoStageQrCard } from './internal/ui/KkPromoStageQrCard';
import { KkPromoStageTicker } from './internal/ui/KkPromoStageTicker';

export const KkPromoStage = Object.assign(KkPromoStageRoot, {
  Masthead: KkPromoStageMasthead,
  Scene: KkPromoStageScene,
  Copy: KkPromoStageCopy,
  Kicker: KkPromoStageKicker,
  Headline: KkPromoStageHeadline,
  Lead: KkPromoStageLead,
  Device: KkPromoStageDevice,
  Phone: KkPromoStagePhone,
  Browser: KkPromoStageBrowser,
  PhotoWall: KkPromoStagePhotoWall,
  NameWall: KkPromoStageNameWall,
  Crest: KkPromoStageCrest,
  Index: KkPromoStageIndex,
  Corner: KkPromoStageCorner,
  QrCard: KkPromoStageQrCard,
  Foot: KkPromoStageFoot,
  Ticker: KkPromoStageTicker,
  Arrivals: KkPromoStageArrivals,
});
