import { useNavigate, useSearch } from '@tanstack/react-router';
import { useBeerStockQuery } from '@/features/manage-beer-list/api';
import type { BeerHubSummary } from '@/features/manage-beer-list/beer-hub';
import { SPARK_DAYS } from '@/features/manage-beer-list/beer-hub';
import type { BeerHubState } from '@/features/manage-beer-list/hooks/use-beer-hub';
import { useBeerHub } from '@/features/manage-beer-list/hooks/use-beer-hub';
import type { LabStockState } from '../schemas';
import { deliveriesOf, labStockStateOf, labSummaryOf } from '../stock-chart-lab';

const NO_DELIVERIES: readonly number[] = [];

export interface StockChartLabView {
  summary: BeerHubSummary;
  deliveries: readonly number[];
}

export interface StockChartLab {
  state: LabStockState;
  chooseState: (id: string) => void;
  hubState: BeerHubState['kind'];
  error: Error | null;
  view: StockChartLabView | null;
  reload: () => void;
}

export const useStockChartLab = (): StockChartLab => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/lab_/stock-chart' });
  const state = search.state ?? 'real';
  const hub = useBeerHub();
  const open = hub.state.kind === 'open' ? hub.state.open : null;
  const stockQuery = useBeerStockQuery(open?.pot.beerPotId ?? null);
  const movements = stockQuery.data?.movements;

  return {
    state,
    chooseState: (id) => {
      const next = labStockStateOf(id);

      if (next !== null) {
        void navigate({
          to: '/lab/stock-chart',
          search: next === 'real' ? {} : { state: next },
          replace: true,
          resetScroll: false,
        });
      }
    },
    hubState: hub.state.kind,
    error: hub.state.kind === 'failed' ? hub.state.error : null,
    view:
      open === null
        ? null
        : {
            summary: labSummaryOf(open.summary, state, hub.now),
            deliveries:
              movements === undefined
                ? NO_DELIVERIES
                : deliveriesOf(movements, hub.now, SPARK_DAYS),
          },
    reload: hub.reload,
  };
};
