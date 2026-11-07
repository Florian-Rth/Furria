import { KkSetupTaskBody } from './internal/layout/KkSetupTaskBody';
import { KkSetupTaskRoot } from './internal/layout/KkSetupTaskRoot';
import { KkSetupTaskTools } from './internal/layout/KkSetupTaskTools';
import { KkSetupTaskSentence } from './internal/ui/KkSetupTaskSentence';

export const KkSetupTask = Object.assign(KkSetupTaskRoot, {
  Sentence: KkSetupTaskSentence,
  Body: KkSetupTaskBody,
  Tools: KkSetupTaskTools,
});
