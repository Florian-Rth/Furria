export interface FocusLockInput {
  evening: boolean;
  editing: boolean;
}

export const stepsEditableOf = ({ evening, editing }: FocusLockInput): boolean => {
  if (evening) {
    return false;
  }

  return editing;
};
