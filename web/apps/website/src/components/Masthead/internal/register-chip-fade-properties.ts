const chipFadeProperties = [
  { name: '--chip-fade-start', syntax: '<length>', inherits: false, initialValue: '0px' },
  { name: '--chip-fade-end', syntax: '<length>', inherits: false, initialValue: '0px' },
] as const;

let registered = false;

export const registerChipFadeProperties = (): void => {
  if (registered || typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') {
    return;
  }
  registered = true;
  for (const property of chipFadeProperties) {
    try {
      CSS.registerProperty(property);
    } catch {
      registered = true;
    }
  }
};
