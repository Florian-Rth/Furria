import { PageLayoutBody } from './internal/layout/PageLayoutBody';
import { PageLayoutProse } from './internal/layout/PageLayoutProse';
import { PageLayoutRoot } from './internal/layout/PageLayoutRoot';

export const PageLayout = Object.assign(PageLayoutRoot, {
  Body: PageLayoutBody,
  Prose: PageLayoutProse,
});
