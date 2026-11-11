import { KkCalendarDetailBody } from './internal/layout/KkCalendarDetailBody';
import { KkCalendarDetailFacts } from './internal/layout/KkCalendarDetailFacts';
import { KkCalendarDetailFoot } from './internal/layout/KkCalendarDetailFoot';
import { KkCalendarDetailRoot } from './internal/layout/KkCalendarDetailRoot';
import { KkCalendarDetailFact } from './internal/ui/KkCalendarDetailFact';
import { KkCalendarDetailHead } from './internal/ui/KkCalendarDetailHead';
import { KkCalendarDetailSection } from './internal/ui/KkCalendarDetailSection';
import { KkCalendarDetailText } from './internal/ui/KkCalendarDetailText';

export const KkCalendarDetail = Object.assign(KkCalendarDetailRoot, {
  Body: KkCalendarDetailBody,
  Head: KkCalendarDetailHead,
  Facts: KkCalendarDetailFacts,
  Fact: KkCalendarDetailFact,
  Text: KkCalendarDetailText,
  Section: KkCalendarDetailSection,
  Foot: KkCalendarDetailFoot,
});
