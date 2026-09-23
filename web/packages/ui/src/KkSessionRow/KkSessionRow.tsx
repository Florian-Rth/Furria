import { KkSessionRowBody } from './internal/layout/KkSessionRowBody';
import { KkSessionRowHeading } from './internal/layout/KkSessionRowHeading';
import { KkSessionRowRoot } from './internal/layout/KkSessionRowRoot';
import { KkSessionRowEmblem } from './internal/ui/KkSessionRowEmblem';
import { KkSessionRowMotto } from './internal/ui/KkSessionRowMotto';
import { KkSessionRowSeason } from './internal/ui/KkSessionRowSeason';
import { KkSessionRowVacancy } from './internal/ui/KkSessionRowVacancy';

export const KkSessionRow = Object.assign(KkSessionRowRoot, {
  Emblem: KkSessionRowEmblem,
  Vacancy: KkSessionRowVacancy,
  Body: KkSessionRowBody,
  Heading: KkSessionRowHeading,
  Season: KkSessionRowSeason,
  Motto: KkSessionRowMotto,
});
