export class OfflineWriteError extends Error {
  constructor() {
    super('The write was not sent because the device is offline.');
    this.name = 'OfflineWriteError';
  }
}
