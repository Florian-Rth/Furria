import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { BeerLoadError } from '@/features/manage-beer-list/components/BeerLoadError';
import type { StockChartLab } from '../hooks/use-stock-chart-lab';
import { NO_POT_TEXT, NO_POT_TITLE, VARIANT_ORDER, VARIANT_TITLES } from '../stock-chart-lab';
import { StockChartLabHead } from './StockChartLabHead';

const SKELETON_ROWS = 4;

interface StockChartLabBodyProps {
  lab: StockChartLab;
}

export const StockChartLabBody: FC<StockChartLabBodyProps> = ({ lab }) => {
  const { view, error, hubState, reload } = lab;

  if (view !== null) {
    const sections = VARIANT_ORDER.map((variant) => (
      <KkPanelSection key={variant} title={VARIANT_TITLES[variant]}>
        <StockChartLabHead variant={variant} view={view} />
      </KkPanelSection>
    ));

    return <KkPanelStack>{sections}</KkPanelStack>;
  }
  if (error !== null) {
    return <BeerLoadError error={error} onRetry={reload} />;
  }
  if (hubState === 'empty') {
    return <KkEmptyState title={NO_POT_TITLE} description={NO_POT_TEXT} />;
  }

  return <KkSkeletonRow count={SKELETON_ROWS} shape="select" />;
};
