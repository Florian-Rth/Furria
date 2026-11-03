import type { StudioChange } from '@furria/studio/studio-changes';
import type { Studio } from '@furria/studio/studio-schemas';

export interface StudioDocumentEdit<TStudio extends Studio = Studio> {
  studio: TStudio;
  change: (change: StudioChange) => void;
  startGesture: () => void;
  endGesture: () => void;
  mark: (atSeconds: number, lengthSeconds: number) => void;
  addPart: (firstStepId: number, name: string) => void;
  addSpot: () => number;
  direct: <TResult>(action: () => Promise<TResult>) => Promise<TResult>;
}
