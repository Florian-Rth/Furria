interface LeaveGuardLocation {
  pathname: string;
}

export const blocksLeaving = (current: LeaveGuardLocation, next: LeaveGuardLocation): boolean =>
  current.pathname !== next.pathname;
