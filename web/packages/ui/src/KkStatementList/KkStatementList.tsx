import { KkStatementListRoot } from './internal/layout/KkStatementListRoot';
import { KkStatementListRow } from './internal/ui/KkStatementListRow';

export type { KkStatementMark } from './internal/ui/KkStatementListRow';

export const KkStatementList = Object.assign(KkStatementListRoot, { Row: KkStatementListRow });
