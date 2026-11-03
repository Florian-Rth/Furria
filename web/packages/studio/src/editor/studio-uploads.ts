import type { ChangeEvent } from 'react';

export interface StudioFileInput {
  fileInput: (node: HTMLInputElement | null) => void;
  onChosen: (event: ChangeEvent<HTMLInputElement>) => void;
}
