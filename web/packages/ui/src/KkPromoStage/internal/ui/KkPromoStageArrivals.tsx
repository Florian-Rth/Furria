import { AnimatePresence } from 'motion/react';
import type { FC } from 'react';
import type { KkPromoArrival } from '../../promo-stage-types';
import type { KkPromoArrivalLabels } from './PromoArrival';
import { PromoArrival } from './PromoArrival';

interface KkPromoStageArrivalsProps {
  arrival: KkPromoArrival | null;
  labels: KkPromoArrivalLabels;
}

export const KkPromoStageArrivals: FC<KkPromoStageArrivalsProps> = ({ arrival, labels }) => {
  const shown =
    arrival === null ? null : (
      <PromoArrival key={arrival.key} names={arrival.names} more={arrival.more} labels={labels} />
    );

  return <AnimatePresence>{shown}</AnimatePresence>;
};
