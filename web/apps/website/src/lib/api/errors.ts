export class RequestBlockedError extends Error {
  constructor() {
    super('The request never reached the API - blocked or offline.');
    this.name = 'RequestBlockedError';
  }
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`The API responded with status ${status}.`);
    this.name = 'ApiError';
    this.status = status;
  }
}
