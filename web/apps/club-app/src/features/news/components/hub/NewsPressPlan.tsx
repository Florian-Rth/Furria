import { KkPressPlan } from '@furria/ui';
import type { FC } from 'react';
import { PLAN_LABEL } from '../../hub-copy';
import type { PlanSession } from '../../hub-view';
import { planSegmentsOf } from './hub-lines';

interface NewsPressPlanProps {
  plan: readonly PlanSession[];
  titles: ReadonlyMap<string, string>;
  onReveal: (postId: string) => void;
}

export const NewsPressPlan: FC<NewsPressPlanProps> = ({ plan, titles, onReveal }) => {
  const segments = planSegmentsOf(plan, titles);

  return <KkPressPlan label={PLAN_LABEL} segments={segments} onReveal={onReveal} />;
};
