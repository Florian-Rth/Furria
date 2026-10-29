import { KkMeta } from '@furria/ui/KkMeta';
import { KkSpotlightList } from '@furria/ui/KkSpotlightList';
import type { FC } from 'react';
import { PlannerDetailSection } from '@/features/running-order/components/PlannerDetailSection';
import { NONE, SHARED_ACTS_LABEL, SHARED_TITLE } from '../acts-copy';
import type { SharedAct } from '../acts-overlap';
import { ActSharedRow } from './ActSharedRow';

interface ActSharedSectionProps {
  shared: readonly SharedAct[];
}

export const ActSharedSection: FC<ActSharedSectionProps> = ({ shared }) => {
  const meta = shared.length === 0 ? NONE : String(shared.length);
  const rows = shared.map((entry) => <ActSharedRow key={entry.act.actId} shared={entry} />);
  const content =
    rows.length === 0 ? null : <KkSpotlightList label={SHARED_ACTS_LABEL}>{rows}</KkSpotlightList>;

  const metaLine = <KkMeta>{meta}</KkMeta>;

  return (
    <PlannerDetailSection title={SHARED_TITLE} action={metaLine}>
      {content}
    </PlannerDetailSection>
  );
};
