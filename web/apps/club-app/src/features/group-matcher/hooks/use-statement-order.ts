import { useState } from 'react';
import { inStatementOrder, settleStatementOrder } from '../group-matcher-page';
import type { GroupStatement } from '../schemas';

export const useStatementOrder = (statements: readonly GroupStatement[]): GroupStatement[] => {
  const [order, setOrder] = useState<readonly number[] | null>(null);
  const settled = settleStatementOrder(order, statements);

  if (settled !== order) {
    setOrder(settled);
  }

  return inStatementOrder(statements, settled);
};
