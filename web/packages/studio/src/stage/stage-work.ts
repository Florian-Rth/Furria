import type { Ref } from 'react';
import type { GestureHandlers } from '../gestures/use-gesture';

export interface StageWork {
  areaRef: (node: HTMLDivElement | null) => void;
  planeRef: Ref<HTMLDivElement>;
  handlers: GestureHandlers;
}
