import type { KkCrop } from '@furria/ui/image-crop';
import type { UploadFailure } from './upload-failure';

export interface ChosenPhoto {
  file: File;
  source: string;
}

export type PictureDeskState =
  | { kind: 'resting'; attempt: number }
  | {
      kind: 'cropping';
      attempt: number;
      photo: ChosenPhoto | null;
      source: string;
      initialCrop: KkCrop | null;
      crop: KkCrop | null;
    }
  | { kind: 'saving'; attempt: number; source: string; crop: KkCrop }
  | { kind: 'uploading'; attempt: number; photo: ChosenPhoto; crop: KkCrop | null; share: number }
  | {
      kind: 'failed';
      attempt: number;
      photo: ChosenPhoto;
      crop: KkCrop | null;
      failure: UploadFailure;
    };

export type PictureDeskEvent =
  | { kind: 'chosen'; photo: ChosenPhoto }
  | { kind: 'recrop'; source: string; crop: KkCrop | null }
  | { kind: 'cropChanged'; crop: KkCrop }
  | { kind: 'submitted' }
  | { kind: 'unreadable' }
  | { kind: 'dismissed' }
  | { kind: 'progressed'; attempt: number; share: number }
  | { kind: 'uploaded'; attempt: number }
  | { kind: 'uploadFailed'; attempt: number; failure: UploadFailure }
  | { kind: 'saved'; attempt: number }
  | { kind: 'saveFailed'; attempt: number };

export type PictureDeskEffect =
  | { kind: 'upload'; attempt: number; file: File; crop: KkCrop | null }
  | { kind: 'save'; attempt: number; crop: KkCrop }
  | { kind: 'stop' };

export interface PictureDeskPolicy {
  cutsBeforeUpload: boolean;
}

export interface PictureDeskStep {
  state: PictureDeskState;
  effects: PictureDeskEffect[];
}

export const RESTING_DESK: PictureDeskState = { kind: 'resting', attempt: 0 };

const stay = (state: PictureDeskState): PictureDeskStep => ({ state, effects: [] });

const stopping = (state: PictureDeskState): PictureDeskEffect[] =>
  state.kind === 'uploading' ? [{ kind: 'stop' }] : [];

const uploading = (
  state: PictureDeskState,
  photo: ChosenPhoto,
  crop: KkCrop | null,
): PictureDeskStep => {
  const attempt = state.attempt + 1;
  return {
    state: { kind: 'uploading', attempt, photo, crop, share: 0 },
    effects: [...stopping(state), { kind: 'upload', attempt, file: photo.file, crop }],
  };
};

const submitted = (state: PictureDeskState): PictureDeskStep => {
  if (state.kind === 'failed') {
    return uploading(state, state.photo, state.crop);
  }
  if (state.kind !== 'cropping' || state.crop === null) {
    return stay(state);
  }
  if (state.photo !== null) {
    return uploading(state, state.photo, state.crop);
  }
  const attempt = state.attempt + 1;
  return {
    state: {
      kind: 'saving',
      attempt,
      source: state.source,
      crop: state.crop,
    },
    effects: [{ kind: 'save', attempt, crop: state.crop }],
  };
};

const cropChanged = (state: PictureDeskState, crop: KkCrop): PictureDeskStep =>
  state.kind === 'cropping' || state.kind === 'failed' ? stay({ ...state, crop }) : stay(state);

export const advanceDesk = (
  state: PictureDeskState,
  event: PictureDeskEvent,
  policy: PictureDeskPolicy,
): PictureDeskStep => {
  switch (event.kind) {
    case 'chosen':
      if (!policy.cutsBeforeUpload) {
        return uploading(state, event.photo, null);
      }
      return {
        state: {
          kind: 'cropping',
          attempt: state.attempt,
          photo: event.photo,
          source: event.photo.source,
          initialCrop: null,
          crop: null,
        },
        effects: stopping(state),
      };
    case 'recrop':
      return {
        state: {
          kind: 'cropping',
          attempt: state.attempt,
          photo: null,
          source: event.source,
          initialCrop: event.crop,
          crop: event.crop,
        },
        effects: stopping(state),
      };
    case 'cropChanged':
      return cropChanged(state, event.crop);
    case 'submitted':
      return submitted(state);
    case 'unreadable':
      return state.kind === 'cropping' && state.photo !== null
        ? uploading(state, state.photo, null)
        : stay(state);
    case 'dismissed':
      return { state: { kind: 'resting', attempt: state.attempt }, effects: stopping(state) };
    case 'progressed':
      return state.kind === 'uploading' && state.attempt === event.attempt
        ? stay({ ...state, share: event.share })
        : stay(state);
    case 'uploaded':
      return state.kind === 'uploading' && state.attempt === event.attempt
        ? stay({ kind: 'resting', attempt: state.attempt })
        : stay(state);
    case 'uploadFailed':
      return state.kind === 'uploading' && state.attempt === event.attempt
        ? stay({
            kind: 'failed',
            attempt: state.attempt,
            photo: state.photo,
            crop: state.crop,
            failure: event.failure,
          })
        : stay(state);
    case 'saved':
      return state.kind === 'saving' && state.attempt === event.attempt
        ? stay({ kind: 'resting', attempt: state.attempt })
        : stay(state);
    case 'saveFailed':
      return state.kind === 'saving' && state.attempt === event.attempt
        ? stay({
            kind: 'cropping',
            attempt: state.attempt,
            photo: null,
            source: state.source,
            initialCrop: state.crop,
            crop: state.crop,
          })
        : stay(state);
  }
};

export const deskSourceOf = (state: PictureDeskState): string | null =>
  state.kind === 'cropping' || state.kind === 'uploading' || state.kind === 'failed'
    ? (state.photo?.source ?? null)
    : null;
