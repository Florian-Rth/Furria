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

export interface ApiFieldFailure {
  field: string;
  message: string;
}

export type RequestFailedStatus = 400 | 409 | 422;

const NEUTRAL_FAILURE_MESSAGE = 'Der Server hat die Anfrage abgelehnt.';

export class RequestFailedError extends Error {
  readonly status: RequestFailedStatus;
  readonly failures: readonly ApiFieldFailure[];

  constructor(status: RequestFailedStatus, failures: readonly ApiFieldFailure[]) {
    super(`The API refused the request with status ${status}.`);
    this.name = 'RequestFailedError';
    this.status = status;
    this.failures = failures;
  }

  get firstMessage(): string {
    return this.failures[0]?.message ?? NEUTRAL_FAILURE_MESSAGE;
  }
}
