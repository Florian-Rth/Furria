import { createFileRoute } from '@tanstack/react-router';
import { StockChartLabPage } from '@/features/lab-stock-chart/components/StockChartLabPage';
import { StockChartLabSearchSchema } from '@/features/lab-stock-chart/schemas';

export const Route = createFileRoute('/_app/lab_/stock-chart')({
  component: StockChartLabPage,
  validateSearch: StockChartLabSearchSchema,
});
