export interface KkPourStockLine {
  key: string;
  label: string;
  facts: string;
  outlook: string;
  warn: boolean;
  values: readonly number[];
  forecastDays: number | null;
}

export interface KkPourStockLinesLabels {
  from: string;
  now: string;
}
