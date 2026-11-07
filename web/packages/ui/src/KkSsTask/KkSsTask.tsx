import { KkSsTaskBody } from './internal/layout/KkSsTaskBody';
import { KkSsTaskRoot } from './internal/layout/KkSsTaskRoot';
import { KkSsTaskTools } from './internal/layout/KkSsTaskTools';
import { KkSsTaskSentence } from './internal/ui/KkSsTaskSentence';

export const KkSsTask = Object.assign(KkSsTaskRoot, {
  Sentence: KkSsTaskSentence,
  Body: KkSsTaskBody,
  Tools: KkSsTaskTools,
});
