export class SessionPersistenceError extends Error {
  constructor() {
    super('The refresh token could not be persisted - the session was discarded.');
    this.name = 'SessionPersistenceError';
  }
}
