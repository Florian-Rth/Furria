export type UploadPhase = 'queued' | 'uploading' | 'processing' | 'ready' | 'failed';

export interface UploadMoment {
  phase: UploadPhase;
  progress: number;
}

export const UPLOAD_STREAMS = 4;
export const SECONDS_PER_FILE = 1.6;
export const PROCESSING_SECONDS = 3.2;

export const uploadMomentAt = (
  position: number,
  elapsedSeconds: number,
  failing: boolean,
): UploadMoment => {
  const starts = Math.floor(position / UPLOAD_STREAMS) * SECONDS_PER_FILE;
  const sent = starts + SECONDS_PER_FILE;
  if (elapsedSeconds < starts) {
    return { phase: 'queued', progress: 0 };
  }
  if (elapsedSeconds < sent) {
    return { phase: 'uploading', progress: (elapsedSeconds - starts) / SECONDS_PER_FILE };
  }
  if (failing) {
    return { phase: 'failed', progress: 1 };
  }
  if (elapsedSeconds < sent + PROCESSING_SECONDS) {
    return { phase: 'processing', progress: 1 };
  }
  return { phase: 'ready', progress: 1 };
};

export const sentCountAt = (total: number, elapsedSeconds: number): number =>
  Math.min(Math.floor(elapsedSeconds / SECONDS_PER_FILE) * UPLOAD_STREAMS, total);

export const elapsedForSent = (sent: number): number => (sent / UPLOAD_STREAMS) * SECONDS_PER_FILE;

export const remainingMinutesAt = (total: number, elapsedSeconds: number): number => {
  const left = total - sentCountAt(total, elapsedSeconds);
  return Math.ceil(((left / UPLOAD_STREAMS) * SECONDS_PER_FILE) / 60);
};
