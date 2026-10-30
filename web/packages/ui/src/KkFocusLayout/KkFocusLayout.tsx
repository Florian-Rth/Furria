import { KkFocusLayoutCenter } from './internal/layout/KkFocusLayoutCenter';
import { KkFocusLayoutFloat } from './internal/layout/KkFocusLayoutFloat';
import { KkFocusLayoutOutline } from './internal/layout/KkFocusLayoutOutline';
import { KkFocusLayoutRoot } from './internal/layout/KkFocusLayoutRoot';
import { KkFocusLayoutStage } from './internal/layout/KkFocusLayoutStage';
import { KkFocusLayoutStrip } from './internal/layout/KkFocusLayoutStrip';
import { KkFocusLayoutTime } from './internal/layout/KkFocusLayoutTime';
import { KkFocusLayoutTop } from './internal/layout/KkFocusLayoutTop';

export const KkFocusLayout = Object.assign(KkFocusLayoutRoot, {
  Top: KkFocusLayoutTop,
  Outline: KkFocusLayoutOutline,
  Stage: KkFocusLayoutStage,
  Float: KkFocusLayoutFloat,
  Center: KkFocusLayoutCenter,
  Time: KkFocusLayoutTime,
  Strip: KkFocusLayoutStrip,
});
