const savesInFlight = new Map<number, Promise<void>>();

const settledOf = (save: Promise<boolean>): Promise<void> =>
  save.then(
    () => undefined,
    () => undefined,
  );

export const trackNewsSave = (newsPostId: number, save: Promise<boolean>): void => {
  const previous = savesInFlight.get(newsPostId) ?? Promise.resolve();
  const settled = previous.then(() => settledOf(save));
  savesInFlight.set(newsPostId, settled);
  void settled.then(() => {
    if (savesInFlight.get(newsPostId) === settled) {
      savesInFlight.delete(newsPostId);
    }
  });
};

export const newsSavesSettled = (newsPostId: number): Promise<void> =>
  savesInFlight.get(newsPostId) ?? Promise.resolve();
