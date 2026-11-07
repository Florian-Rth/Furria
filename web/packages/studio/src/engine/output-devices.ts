export const outputLostOf = (before: readonly string[], after: readonly string[]): boolean =>
  before.length === 0 ||
  after.length < before.length ||
  before.some((output) => !after.includes(output));
