import { KkBulletinHead } from './internal/layout/KkBulletinHead';
import { KkBulletinLines } from './internal/layout/KkBulletinLines';
import { KkBulletinRoot } from './internal/layout/KkBulletinRoot';
import { KkBulletinExcerpt } from './internal/ui/KkBulletinExcerpt';
import { KkBulletinLine } from './internal/ui/KkBulletinLine';
import { KkBulletinMarks } from './internal/ui/KkBulletinMarks';
import { KkBulletinMeta } from './internal/ui/KkBulletinMeta';
import { KkBulletinNewMark } from './internal/ui/KkBulletinNewMark';
import { KkBulletinTitle } from './internal/ui/KkBulletinTitle';

export const KkBulletin = Object.assign(KkBulletinRoot, {
  Head: KkBulletinHead,
  Title: KkBulletinTitle,
  Meta: KkBulletinMeta,
  Excerpt: KkBulletinExcerpt,
  Lines: KkBulletinLines,
  Line: KkBulletinLine,
  Marks: KkBulletinMarks,
  NewMark: KkBulletinNewMark,
});
