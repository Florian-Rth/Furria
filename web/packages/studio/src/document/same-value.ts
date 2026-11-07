type Comparable = string | number | boolean | null | undefined | object;

const entriesOf = (value: object): [string, Comparable][] =>
  Object.entries(value).filter(([, entry]) => entry !== undefined);

export const sameValue = (left: Comparable, right: Comparable): boolean => {
  if (left === right) {
    return true;
  }
  if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) {
    return false;
  }
  if (Array.isArray(left) !== Array.isArray(right)) {
    return false;
  }

  const leftEntries = entriesOf(left);
  const rightEntries = new Map(entriesOf(right));

  return (
    leftEntries.length === rightEntries.size &&
    leftEntries.every(
      ([key, entry]) => rightEntries.has(key) && sameValue(entry, rightEntries.get(key)),
    )
  );
};
