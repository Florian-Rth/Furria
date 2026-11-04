import { KkPourPageBody } from './internal/layout/KkPourPageBody';
import { KkPourPageHead } from './internal/layout/KkPourPageHead';
import { KkPourPageRoot } from './internal/layout/KkPourPageRoot';
import { KkPourPageThumb } from './internal/layout/KkPourPageThumb';

export const KkPourPage = Object.assign(KkPourPageRoot, {
  Head: KkPourPageHead,
  Body: KkPourPageBody,
  Thumb: KkPourPageThumb,
});
