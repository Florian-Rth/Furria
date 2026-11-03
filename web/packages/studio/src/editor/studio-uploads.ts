import type { UploadFailure } from '@furria/api-client/upload-failure';
import type { ChangeEvent } from 'react';

export interface StudioFileInput {
  fileInput: (node: HTMLInputElement | null) => void;
  onChosen: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface StudioUpload {
  key: string;
  name: string;
  share: number;
  failure: UploadFailure | null;
}

export interface StudioUploads extends StudioFileInput {
  rows: readonly StudioUpload[];
  choose: () => void;
  dismiss: (key: string) => void;
}

export type StudioUploadOutcome =
  | { kind: 'sent'; mediaItemId: number | null }
  | { kind: 'failed'; failure: UploadFailure }
  | { kind: 'stopped' };

export interface StudioUploadHandle {
  progress: (listener: (progress: { share: number }) => void) => () => void;
  done: Promise<StudioUploadOutcome>;
}

export interface StudioUploadPort {
  start: (file: File) => StudioUploadHandle;
  add: (mediaItemId: number) => Promise<void>;
}
