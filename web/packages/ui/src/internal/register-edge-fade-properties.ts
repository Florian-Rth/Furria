const edgeFadeProperties = [
  { name: '--kk-edge-fade-start', syntax: '<length>', inherits: false, initialValue: '0px' },
  { name: '--kk-edge-fade-end', syntax: '<length>', inherits: false, initialValue: '0px' },
] as const;

let registered = false;

export const registerEdgeFadeProperties = (): void => {
  if (registered || typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') {
    return;
  }
  registered = true;
  for (const property of edgeFadeProperties) {
    try {
      CSS.registerProperty(property);
    } catch {
      registered = true;
    }
  }
};
