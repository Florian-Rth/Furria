import { describe, expect, it } from 'vitest';
import type {
  ChosenPhoto,
  PictureDeskEvent,
  PictureDeskPolicy,
  PictureDeskState,
  PictureDeskStep,
} from './picture-desk';
import { advanceDesk, RESTING_DESK } from './picture-desk';

const CUT_FIRST: PictureDeskPolicy = { cutsBeforeUpload: true };
const UPLOAD_FIRST: PictureDeskPolicy = { cutsBeforeUpload: false };

const photo: ChosenPhoto = { file: new File(['x'], 'garde.jpg'), source: 'blob:garde' };
const cut = { left: 0, top: 0.25, width: 1, height: 0.5 };

const run = (
  policy: PictureDeskPolicy,
  events: readonly PictureDeskEvent[],
  from: PictureDeskState = RESTING_DESK,
): PictureDeskStep =>
  events.reduce<PictureDeskStep>((step, event) => advanceDesk(step.state, event, policy), {
    state: from,
    effects: [],
  });

describe('advanceDesk', () => {
  it('lets a chosen photo be cut before it is uploaded with that cut', () => {
    const step = run(CUT_FIRST, [
      { kind: 'chosen', photo },
      { kind: 'cropChanged', crop: cut },
      { kind: 'submitted' },
    ]);
    expect(step.state).toEqual({ kind: 'uploading', attempt: 1, photo, crop: cut, share: 0 });
    expect(step.effects).toEqual([{ kind: 'upload', attempt: 1, file: photo.file, crop: cut }]);
  });

  it('waits for a cut before uploading', () => {
    const step = run(CUT_FIRST, [{ kind: 'chosen', photo }, { kind: 'submitted' }]);
    expect(step.state.kind).toBe('cropping');
    expect(step.effects).toEqual([]);
  });

  it('uploads at once when cutting follows the upload', () => {
    const step = run(UPLOAD_FIRST, [{ kind: 'chosen', photo }]);
    expect(step.effects).toEqual([{ kind: 'upload', attempt: 1, file: photo.file, crop: null }]);
  });

  it('uploads a photo that cannot be shown for cutting uncut', () => {
    const step = run(CUT_FIRST, [{ kind: 'chosen', photo }, { kind: 'unreadable' }]);
    expect(step.effects).toEqual([{ kind: 'upload', attempt: 1, file: photo.file, crop: null }]);
  });

  it('follows the progress of the running upload and rests once it is sent', () => {
    const uploading = run(UPLOAD_FIRST, [
      { kind: 'chosen', photo },
      { kind: 'progressed', attempt: 1, share: 0.4 },
    ]);
    expect(uploading.state).toEqual({
      kind: 'uploading',
      attempt: 1,
      photo,
      crop: null,
      share: 0.4,
    });
    expect(run(UPLOAD_FIRST, [{ kind: 'uploaded', attempt: 1 }], uploading.state).state).toEqual({
      kind: 'resting',
      attempt: 1,
    });
  });

  it('keeps a failed upload with its cut and retries it as a new attempt', () => {
    const failed = run(CUT_FIRST, [
      { kind: 'chosen', photo },
      { kind: 'cropChanged', crop: cut },
      { kind: 'submitted' },
      { kind: 'uploadFailed', attempt: 1, failure: 'tooLarge' },
    ]);
    expect(failed.state).toEqual({
      kind: 'failed',
      attempt: 1,
      photo,
      crop: cut,
      failure: 'tooLarge',
    });
    expect(run(CUT_FIRST, [{ kind: 'submitted' }], failed.state).effects).toEqual([
      { kind: 'upload', attempt: 2, file: photo.file, crop: cut },
    ]);
  });

  it('does not re-upload a failed uncut photo on its own', () => {
    const failed = run(CUT_FIRST, [
      { kind: 'chosen', photo },
      { kind: 'unreadable' },
      { kind: 'uploadFailed', attempt: 1, failure: 'interrupted' },
      { kind: 'unreadable' },
    ]);
    expect(failed.state.kind).toBe('failed');
    expect(failed.effects).toEqual([]);
  });

  it.each<[string, PictureDeskEvent]>([
    ['dismissing', { kind: 'dismissed' }],
    ['choosing another photo', { kind: 'chosen', photo }],
    ['recutting the current picture', { kind: 'recrop', source: 'https://cdn/x.jpg', crop: cut }],
  ])('stops the running upload when %s', (_, event) => {
    const uploading = run(UPLOAD_FIRST, [{ kind: 'chosen', photo }]).state;
    expect(advanceDesk(uploading, event, CUT_FIRST).effects[0]).toEqual({ kind: 'stop' });
  });

  it.each<[string, PictureDeskEvent]>([
    ['progress', { kind: 'progressed', attempt: 1, share: 0.9 }],
    ['success', { kind: 'uploaded', attempt: 1 }],
    ['failure', { kind: 'uploadFailed', attempt: 1, failure: 'gone' }],
  ])('ignores late %s of an abandoned upload', (_, event) => {
    const retaken = run(UPLOAD_FIRST, [
      { kind: 'chosen', photo },
      { kind: 'chosen', photo },
    ]).state;
    expect(advanceDesk(retaken, event, UPLOAD_FIRST).state).toBe(retaken);
  });

  it('saves a new cut of the current picture and rests once saved', () => {
    const saving = run(CUT_FIRST, [
      { kind: 'recrop', source: 'https://cdn/x.jpg', crop: null },
      { kind: 'cropChanged', crop: cut },
      { kind: 'submitted' },
    ]);
    expect(saving.effects).toEqual([{ kind: 'save', attempt: 1, crop: cut }]);
    expect(run(CUT_FIRST, [{ kind: 'saved', attempt: 1 }], saving.state).state.kind).toBe(
      'resting',
    );
  });

  it('reopens the cut it could not save, starting from that cut', () => {
    const reopened = run(CUT_FIRST, [
      { kind: 'recrop', source: 'https://cdn/x.jpg', crop: null },
      { kind: 'cropChanged', crop: cut },
      { kind: 'submitted' },
      { kind: 'saveFailed', attempt: 1 },
    ]);
    expect(reopened.state).toEqual({
      kind: 'cropping',
      attempt: 1,
      photo: null,
      source: 'https://cdn/x.jpg',
      initialCrop: cut,
      crop: cut,
    });
  });

  it('ignores a save that finishes after the cut was dismissed', () => {
    const dismissed = run(CUT_FIRST, [
      { kind: 'recrop', source: 'https://cdn/x.jpg', crop: cut },
      { kind: 'submitted' },
      { kind: 'dismissed' },
      { kind: 'saveFailed', attempt: 1 },
    ]);
    expect(dismissed.state).toEqual({ kind: 'resting', attempt: 1 });
  });
});
