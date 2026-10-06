import type { KkScreenOrigin } from '@furria/ui';

interface RootScreenFrame {
  section: string;
  origin?: never;
}

interface NestedScreenFrame {
  origin: KkScreenOrigin;
  section?: never;
}

export type ScreenFrame = RootScreenFrame | NestedScreenFrame;
