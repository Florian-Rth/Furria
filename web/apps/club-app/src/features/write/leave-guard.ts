interface LeaveGuardLocation {
  pathname: string;
  search: object;
}

const landsAfterSave = (next: LeaveGuardLocation): boolean =>
  'changed' in next.search && next.search.changed !== undefined;

export const blocksLeaving = (current: LeaveGuardLocation, next: LeaveGuardLocation): boolean =>
  current.pathname !== next.pathname && !landsAfterSave(next);
