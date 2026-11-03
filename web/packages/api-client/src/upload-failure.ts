export type UploadFailure =
  | 'tooLarge'
  | 'notAccepted'
  | 'notAllowed'
  | 'gone'
  | 'ended'
  | 'interrupted';

const UPLOAD_FAILURE_BY_STATUS: Record<number, UploadFailure> = {
  403: 'notAllowed',
  404: 'gone',
  413: 'tooLarge',
  410: 'ended',
  415: 'notAccepted',
};

const GONE_STATUS = 404;
const CREATION_METHOD = 'POST';

export const transferStatusOf = (status: number | null, method: string | null): number | null =>
  status === GONE_STATUS && method !== CREATION_METHOD ? null : status;

export const uploadFailureOfStatus = (status: number | null): UploadFailure =>
  (status === null ? undefined : UPLOAD_FAILURE_BY_STATUS[status]) ?? 'interrupted';

export class UploadFailedError extends Error {
  readonly failure: UploadFailure;

  constructor(failure: UploadFailure) {
    super(failure);
    this.failure = failure;
  }
}

export const failureOfError = (error: Error): UploadFailure =>
  error instanceof UploadFailedError ? error.failure : 'interrupted';
