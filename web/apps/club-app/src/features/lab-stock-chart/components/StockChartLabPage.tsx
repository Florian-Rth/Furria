import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useStockChartLab } from '../hooks/use-stock-chart-lab';
import {
  STATE_CHOICE_LABEL,
  STATE_CHOICES,
  STOCK_CHART_LAB_LEAD,
  STOCK_CHART_LAB_TITLE,
} from '../stock-chart-lab';
import { StockChartLabBody } from './StockChartLabBody';

const header = <KkTitleHeader title={STOCK_CHART_LAB_TITLE} lead={STOCK_CHART_LAB_LEAD} />;

export const StockChartLabPage: FC = () => {
  const lab = useStockChartLab();
  const stateChoice = (
    <KkChoiceChips
      label={STATE_CHOICE_LABEL}
      choices={STATE_CHOICES}
      value={lab.state}
      onChange={lab.chooseState}
    />
  );

  return (
    <KkScreen
      kind="detail"
      title={STOCK_CHART_LAB_TITLE}
      origin={LAB_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
    >
      <KkPanelStack>
        {stateChoice}
        <RequirePermission permissionKey={PERMISSION_KEYS.beerListManage}>
          <StockChartLabBody lab={lab} />
        </RequirePermission>
      </KkPanelStack>
    </KkScreen>
  );
};
