import type { ActPageFact } from '@/features/acts/act-page-copy';
import { actFactsOf, studioFactsOf } from '@/features/acts/act-page-copy';
import { studioOverviewOf } from '@/features/acts/act-studio';
import { actPagePathOf } from '@/features/acts/acts-origin';
import type { ActStudioResponse } from '@/features/acts/schemas';

export interface AgendaDetailsView {
  facts: ActPageFact[];
  studioTo: string;
  studioSearch: Record<string, string>;
  eveningsSearch: Record<string, string>;
}

export const useAgendaDetails = (
  data: ActStudioResponse,
  viewerId: number | null,
): AgendaDetailsView => {
  const actFacts = actFactsOf(data.act);
  const studioFacts =
    data.studio === null ? [] : studioFactsOf(studioOverviewOf(data.studio, viewerId));

  return {
    facts: [...actFacts, ...studioFacts],
    studioTo: actPagePathOf(data.act.actId),
    studioSearch: { from: 'start' },
    eveningsSearch: { view: 'details' },
  };
};
