import type { Studio } from '../models/studio-schemas';
import type { SavedTrack, SaveWrite } from './save-plan';

export type ServerWrite =
  | Exclude<SaveWrite, { kind: 'tracks' }>
  | { kind: 'tracks'; baseVersion: number | null; tracks: readonly SavedTrack[] };

export type SaveOutcome =
  | { kind: 'done' }
  | { kind: 'created'; ids: readonly number[] }
  | { kind: 'choreographySaved'; version: number }
  | { kind: 'choreographyRefused'; spotIds: readonly number[] }
  | { kind: 'rejected' };

export interface StudioSavePort {
  save: (write: ServerWrite) => Promise<SaveOutcome>;
  load: () => Promise<Studio>;
}
