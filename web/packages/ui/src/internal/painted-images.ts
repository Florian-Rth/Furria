const paintedSources = new Set<string>();

export const markPainted = (source: string): void => {
  paintedSources.add(source);
};

export const wasPainted = (source: string): boolean => paintedSources.has(source);
