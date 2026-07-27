import { NewsAufmacherMediaColumn } from './internal/layout/NewsAufmacherMediaColumn';
import { NewsAufmacherRoot } from './internal/layout/NewsAufmacherRoot';
import { NewsAufmacherTextColumn } from './internal/layout/NewsAufmacherTextColumn';
import { NewsAufmacherFooter } from './internal/ui/NewsAufmacherFooter';
import { NewsAufmacherHeadline } from './internal/ui/NewsAufmacherHeadline';
import { NewsAufmacherMeta } from './internal/ui/NewsAufmacherMeta';
import { NewsAufmacherTeaser } from './internal/ui/NewsAufmacherTeaser';

export const NewsAufmacher = Object.assign(NewsAufmacherRoot, {
  MediaColumn: NewsAufmacherMediaColumn,
  TextColumn: NewsAufmacherTextColumn,
  Meta: NewsAufmacherMeta,
  Headline: NewsAufmacherHeadline,
  Teaser: NewsAufmacherTeaser,
  Footer: NewsAufmacherFooter,
});
