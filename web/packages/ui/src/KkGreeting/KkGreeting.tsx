import { KkGreetingRoot } from './internal/layout/KkGreetingRoot';
import { KkGreetingHeadline } from './internal/ui/KkGreetingHeadline';
import { KkGreetingLine } from './internal/ui/KkGreetingLine';

export const KkGreeting = Object.assign(KkGreetingRoot, {
  Headline: KkGreetingHeadline,
  Line: KkGreetingLine,
});
