import { KkModalFrameBody } from './internal/layout/KkModalFrameBody';
import { KkModalFrameFields } from './internal/layout/KkModalFrameFields';
import { KkModalFrameFooter } from './internal/layout/KkModalFrameFooter';
import { KkModalFrameRoot } from './internal/layout/KkModalFrameRoot';
import { KkModalFrameKicker } from './internal/ui/KkModalFrameKicker';
import { KkModalFrameTitle } from './internal/ui/KkModalFrameTitle';

export const KkModalFrame = Object.assign(KkModalFrameRoot, {
  Kicker: KkModalFrameKicker,
  Title: KkModalFrameTitle,
  Body: KkModalFrameBody,
  Fields: KkModalFrameFields,
  Footer: KkModalFrameFooter,
});
