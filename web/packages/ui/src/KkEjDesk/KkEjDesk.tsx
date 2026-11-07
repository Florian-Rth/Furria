import { KkEjDeskArea } from './internal/layout/KkEjDeskArea';
import { KkEjDeskRoot } from './internal/layout/KkEjDeskRoot';

export type { KkEjDeskAreaName } from './internal/layout/KkEjDeskArea';
export type { KkEjDeskFit } from './internal/layout/KkEjDeskRoot';

export const KkEjDesk = Object.assign(KkEjDeskRoot, {
  Area: KkEjDeskArea,
});
