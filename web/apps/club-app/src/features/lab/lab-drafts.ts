import type { KkIconName } from '@furria/ui/KkIcon';
import {
  STOCK_CHART_LAB_LEAD,
  STOCK_CHART_LAB_TITLE,
} from '@/features/lab-stock-chart/stock-chart-lab';

export const LAB_DRAFTS_TITLE = 'Entwürfe';

export interface LabDraft {
  slug: string;
  title: string;
  meta: string;
  icon: KkIconName;
  to: '/lab/stock-chart';
}

export const LAB_DRAFTS: readonly LabDraft[] = [
  {
    slug: 'stock-chart',
    title: STOCK_CHART_LAB_TITLE,
    meta: STOCK_CHART_LAB_LEAD,
    icon: 'beer',
    to: '/lab/stock-chart',
  },
];
