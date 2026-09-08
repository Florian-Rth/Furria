export class RequestBlockedError extends Error {
  constructor() {
    super('The request never reached the API - blocked or offline.');
    this.name = 'RequestBlockedError';
  }
}

export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor() {
    super('The API rejected the request with status 401.');
    this.name = 'UnauthorizedError';
  }
}

export class ServerFailureError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`The API responded with status ${status}.`);
    this.name = 'ServerFailureError';
    this.status = status;
  }
}
