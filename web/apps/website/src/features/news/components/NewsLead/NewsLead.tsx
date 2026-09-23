import { NewsLeadMediaColumn } from './internal/layout/NewsLeadMediaColumn';
import { NewsLeadRoot } from './internal/layout/NewsLeadRoot';
import { NewsLeadTextColumn } from './internal/layout/NewsLeadTextColumn';
import { NewsLeadFooter } from './internal/ui/NewsLeadFooter';
import { NewsLeadHeadline } from './internal/ui/NewsLeadHeadline';
import { NewsLeadMeta } from './internal/ui/NewsLeadMeta';
import { NewsLeadTeaser } from './internal/ui/NewsLeadTeaser';

export const NewsLead = Object.assign(NewsLeadRoot, {
  MediaColumn: NewsLeadMediaColumn,
  TextColumn: NewsLeadTextColumn,
  Meta: NewsLeadMeta,
  Headline: NewsLeadHeadline,
  Teaser: NewsLeadTeaser,
  Footer: NewsLeadFooter,
});
