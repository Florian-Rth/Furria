export interface ApiFieldFailure {
  field: string;
  message: string;
}

export class RequestBlockedError extends Error {
  constructor() {
    super('The request never reached the API - blocked or offline.');
    this.name = 'RequestBlockedError';
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly failures: readonly ApiFieldFailure[];

  constructor(status: number, failures: readonly ApiFieldFailure[] = []) {
    super(`The API responded with status ${status}.`);
    this.name = 'ApiError';
    this.status = status;
    this.failures = failures;
  }
}
