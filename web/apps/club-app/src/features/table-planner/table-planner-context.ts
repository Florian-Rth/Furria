import { createContext, useContext } from 'react';
import type { TablePlanner } from './hooks/use-table-planner';

export const TablePlannerContext = createContext<TablePlanner | null>(null);

export const useTablePlannerContext = (): TablePlanner => {
  const planner = useContext(TablePlannerContext);

  if (planner === null) {
    throw new Error('useTablePlannerContext must be used inside the table planner.');
  }

  return planner;
};
