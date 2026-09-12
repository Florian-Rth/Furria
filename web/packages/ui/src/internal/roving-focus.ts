const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];
const FIRST_KEY = 'Home';
const LAST_KEY = 'End';

const STEP_FORWARD = 1;
const STEP_BACK = -1;
const FIRST_INDEX = 0;

const stepOf = (key: string): number | null => {
  if (NEXT_KEYS.includes(key)) {
    return STEP_FORWARD;
  }

  if (PREVIOUS_KEYS.includes(key)) {
    return STEP_BACK;
  }

  return null;
};

export const nextRovingId = (
  ids: readonly string[],
  activeId: string | undefined,
  key: string,
): string | null => {
  const last = ids.length - 1;

  if (last < FIRST_INDEX) {
    return null;
  }

  if (key === FIRST_KEY) {
    return ids[FIRST_INDEX] ?? null;
  }

  if (key === LAST_KEY) {
    return ids[last] ?? null;
  }

  const step = stepOf(key);

  if (step === null) {
    return null;
  }

  const activeIndex = activeId === undefined ? -1 : ids.indexOf(activeId);
  const from = activeIndex < FIRST_INDEX ? FIRST_INDEX : activeIndex;
  const target = (from + step + ids.length) % ids.length;

  return ids[target] ?? null;
};
