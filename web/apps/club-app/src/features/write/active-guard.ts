export interface ActiveLeaveGuard {
  requestLeave: () => boolean;
}

let activeGuard: ActiveLeaveGuard | null = null;

export const registerActiveLeaveGuard = (guard: ActiveLeaveGuard): (() => void) => {
  activeGuard = guard;

  return () => {
    if (activeGuard === guard) {
      activeGuard = null;
    }
  };
};

export const requestActiveLeave = (): boolean => {
  if (activeGuard === null) {
    return false;
  }

  return activeGuard.requestLeave();
};
