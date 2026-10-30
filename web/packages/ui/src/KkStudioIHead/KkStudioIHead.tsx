import { KkStudioIHeadRoot } from './internal/layout/KkStudioIHeadRoot';
import { KkStudioIHeadTitles } from './internal/layout/KkStudioIHeadTitles';
import { KkStudioIHeadEyebrow } from './internal/ui/KkStudioIHeadEyebrow';
import { KkStudioIHeadName } from './internal/ui/KkStudioIHeadName';
import { KkStudioIHeadNote } from './internal/ui/KkStudioIHeadNote';
import { KkStudioIHeadNumber } from './internal/ui/KkStudioIHeadNumber';
import { KkStudioIHeadTitle } from './internal/ui/KkStudioIHeadTitle';

export const KkStudioIHead = Object.assign(KkStudioIHeadRoot, {
  Number: KkStudioIHeadNumber,
  Titles: KkStudioIHeadTitles,
  Eyebrow: KkStudioIHeadEyebrow,
  Name: KkStudioIHeadName,
  Note: KkStudioIHeadNote,
  Title: KkStudioIHeadTitle,
});
